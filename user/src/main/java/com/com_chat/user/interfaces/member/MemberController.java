package com.com_chat.user.interfaces.member;

import com.com_chat.user.application.member.MemberFacade;
import com.com_chat.user.support.exceptions.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
            @PathVariable String query,
            @PageableDefault(page = 0, size = 10, sort = "nick", direction = Sort.Direction.ASC) Pageable pageable){
        return ApiResponse.ok(
                ApiDto.SearchResponse.fromResult(
                        memberFacade.search(new ApiDto.SearchRequest(type,query,pageable).toCriteria())
                )
        );
    }

    @PatchMapping("/update")
    public ApiResponse<Void> update(
            @RequestBody ApiDto.UpdateRequest request
    )
    {
        memberFacade.update(request.toCriteria());
        return ApiResponse.ok();
    }
}
