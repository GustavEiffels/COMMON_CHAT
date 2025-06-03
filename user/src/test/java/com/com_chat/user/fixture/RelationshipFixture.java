package com.com_chat.user.fixture;


import com.com_chat.user.domain.relationship.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class RelationshipFixture {
    private final RelationshipRepository repository;
    private final RelationshipService service;

    @Transactional
    public Relationship favorite(Long member1, Long member2){
        DomainRelationsDto.CreateCommand command = new DomainRelationsDto.CreateCommand(
                member1,
                member2,
                RelationshipEnum.RelationType.FAVORITE
        );

        Long relationshipId = service.create(command).relationshipId();
        return repository.findId(relationshipId).orElseThrow();
    }


    @Transactional
    public Relationship block(Long member1, Long member2){
        DomainRelationsDto.CreateCommand command = new DomainRelationsDto.CreateCommand(
                member1,
                member2,
                RelationshipEnum.RelationType.BLOCK
        );

        Long relationshipId = service.create(command).relationshipId();
        return repository.findId(relationshipId).orElseThrow();
    }


}
