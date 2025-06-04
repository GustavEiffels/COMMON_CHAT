package com.com_chat.user.interfaces.relationship;


import com.com_chat.user.application.relationship.RelationshipFacade;
import com.com_chat.user.domain.relationship.RelationshipEnum;
import com.com_chat.user.support.exceptions.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/relationships")
public class RelationshipController {
    private final RelationshipFacade relationshipFacade;

    @PostMapping("/follow")
    public ApiResponse<ApiDto.CreateResponse> follow(
            @RequestBody ApiDto.CreateRequest request
    )
    {
        return ApiResponse.ok(
                ApiDto.CreateResponse.fromResult(
                        relationshipFacade.create(
                                request.toCriteria(
                                        RelationshipEnum.RelationType.FAVORITE
                                )
                        )
                )
        );
    }

    @PostMapping("/block")
    public ApiResponse<ApiDto.CreateResponse> block(
            @RequestBody ApiDto.CreateRequest request
    ){
        return ApiResponse.ok(
                ApiDto.CreateResponse.fromResult(
                        relationshipFacade.create(
                                request.toCriteria(
                                        RelationshipEnum.RelationType.BLOCK
                                )
                        )
                )
        );
    }
}
