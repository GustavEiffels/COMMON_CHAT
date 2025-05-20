package com.com_chat.user.interfaces.member;

import com.com_chat.user.application.member.MemberFacade;
import com.com_chat.user.support.exceptions.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
public class MemberController {

    private final MemberFacade memberFacade;


    @PostMapping("")
    public ApiResponse<ApiDto.SignUpResponse> signUp(
            @RequestBody  ApiDto.SignUpRequest request
    ){
        return ApiResponse.ok(
                ApiDto.SignUpResponse.fromResult(
                        memberFacade.signUp(request.toCriteria())
                )
        );
    }
    @GetMapping("/search/{type}/{query}")
    public ApiResponse<ApiDto.SearchResponse> search(
            @PathVariable String type,
            @PathVariable String query){
        return null;
    }

}
