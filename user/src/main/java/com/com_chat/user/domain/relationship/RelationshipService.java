package com.com_chat.user.domain.relationship;

import com.com_chat.user.support.exceptions.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RelationshipService {

    private final RelationshipRepository repository;


    public DomainRelationsDto.FindInfo loginFind(Long memberId){
        return DomainRelationsDto.FindInfo.fromDomainList(repository.findByLogin(memberId));
    }


    public DomainRelationsDto.CreateInfo create(DomainRelationsDto.CreateCommand command){

        Optional<Relationship> optionalRelationship = repository.findOne(command.fromMemberId(), command.toMemberId());

        if( optionalRelationship.isPresent() ){
            Relationship fndRelationShip = optionalRelationship.get();
            RelationshipEnum.RelationType createType  = command.createType();
            RelationshipEnum.RelationType currentType = fndRelationShip.type();

            validateUpdate(RelationshipEnum.Command.ADD,createType,currentType);
            return DomainRelationsDto.CreateInfo.fromDomain(repository.save(fndRelationShip.updateRelationType(createType)));
        }
        return DomainRelationsDto.CreateInfo.fromDomain(repository.save(command.toDomain()));
    }

    public DomainRelationsDto.UpdateInfo update(DomainRelationsDto.UpdateCommand command) {

        Relationship relationship = repository.findId(command.relationshipId())
                .orElseThrow(() -> new BaseException(RelationshipException.NOT_EXIST));

        RelationshipEnum.Command        commandType = command.command();
        RelationshipEnum.RelationType  toUpdateType = command.toUpdateType();
        RelationshipEnum.RelationType   currentType = relationship.type();

        validateUpdate(commandType, toUpdateType, currentType);

        Relationship updatedRelationship = updateRelationship(relationship, commandType, toUpdateType);
        return DomainRelationsDto.UpdateInfo.fromDomain(repository.save(updatedRelationship));
    }

    public void validateUpdate(RelationshipEnum.Command command,
                                RelationshipEnum.RelationType toUpdateType,
                                RelationshipEnum.RelationType currentType) {
        if (command == RelationshipEnum.Command.ADD) {
            if (toUpdateType == RelationshipEnum.RelationType.FAVORITE &&
                    currentType == RelationshipEnum.RelationType.BLOCK) {
                throw new BaseException(RelationshipException.ALREADY_BLOCK);
            }
            if (toUpdateType == RelationshipEnum.RelationType.FAVORITE &&
                    currentType == RelationshipEnum.RelationType.FAVORITE) {
                throw new BaseException(RelationshipException.ALREADY_FAVORITE);
            }
            if (toUpdateType == RelationshipEnum.RelationType.BLOCK &&
                    currentType == RelationshipEnum.RelationType.BLOCK) {
                throw new BaseException(RelationshipException.ALREADY_BLOCK);
            }
        }
    }

    public Relationship updateRelationship(Relationship relationship,
                                            RelationshipEnum.Command command,
                                            RelationshipEnum.RelationType toUpdateType) {
        if (command == RelationshipEnum.Command.CANCEL) {
            return relationship.updateRelationType(RelationshipEnum.RelationType.NONE);
        }

        return relationship.updateRelationType(toUpdateType);
    }
}
