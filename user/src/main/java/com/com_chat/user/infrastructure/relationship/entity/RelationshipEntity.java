package com.com_chat.user.infrastructure.relationship.entity;


import com.com_chat.user.domain.relationship.Relationship;
import com.com_chat.user.domain.relationship.RelationshipEnum;
import com.com_chat.user.support.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RelationshipEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long relationshipId;

    private Long fromMemberId;

    private Long toMemberId;

    @Enumerated(EnumType.STRING)
    private RelationshipEnum.RelationType type;

    public RelationshipEntity entityRestore(){
        this.restore();
        return this;
    }

    public RelationshipEntity entityDelete(){
        this.delete();
        return this;
    }

    public Relationship toDomain(){
        return new Relationship(
                this.relationshipId,
                this.fromMemberId,
                this.toMemberId,
                this.type
        );
    }

    public static RelationshipEntity fromDomain(Relationship relationship){
        RelationshipEntity entity = new RelationshipEntity();

        entity.relationshipId = relationship.relationshipId();
        entity.fromMemberId   = relationship.fromMemberId();
        entity.toMemberId     = relationship.toMemberId();
        entity.type           = relationship.type();
        return entity;
    }


}
