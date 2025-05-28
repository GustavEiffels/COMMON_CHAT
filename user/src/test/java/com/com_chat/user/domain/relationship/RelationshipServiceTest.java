package com.com_chat.user.domain.relationship;

import com.com_chat.user.domain.member.MemberRepository;
import com.com_chat.user.support.exceptions.BaseException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RelationshipServiceTest {

    @Mock
    private RelationshipRepository repository;

    @Mock
    private MemberRepository memberRepository;


    @InjectMocks
    private RelationshipService relationshipService;


    @DisplayName("""
            관계 생성 시,
            이미 BLOCK 되거나 Favorite 에 추가된 경우  
            BaseException 이 발생한다.
            """)
    @Test
    void blockMember_to_FavoriteMember(){
        // given
        Long fromMemberId = 1L;
        Long toMemberId   = 2L;
        RelationshipEnum.RelationType relationType = RelationshipEnum.RelationType.FAVORITE;
        DomainRelationsDto.CreateCommand command = new DomainRelationsDto.CreateCommand(
                fromMemberId,
                toMemberId,
                relationType
        );

        Relationship relationship = new Relationship(1L,fromMemberId,toMemberId, RelationshipEnum.RelationType.BLOCK);


        when(repository.findOne(fromMemberId,toMemberId)).thenReturn(Optional.of(relationship));

        // when
        BaseException exception = assertThrows(BaseException.class, ()->{
            relationshipService.create(command);
        });

        // Then
        assertEquals(RelationshipException.ALREADY_BLOCK.getMessage(),exception.getMessage());
    }

}