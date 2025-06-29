package com.com_chat.user.interfaces.member;

import com.com_chat.user.application.member.MemberFacade;
import com.com_chat.user.domain.member.MemberService;
import com.com_chat.user.support.exceptions.ApiResponse;
import lombok.RequiredArgsConstructor;
import nonapi.io.github.classgraph.json.JSONUtils;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
public class MemberController {

    private final MemberFacade memberFacade;
    private final MemberService memberService;


    @PostMapping("")
    public ApiResponse<ApiMemberDto.SignUpResponse> signUp(
            @RequestBody  ApiMemberDto.SignUpRequest request
    ){
        return ApiResponse.ok(
                ApiMemberDto.SignUpResponse.fromResult(
                        memberFacade.signUp(request.toCriteria())
                )
        );
    }
    @GetMapping("/search/{type}/{query}")
    public ApiResponse<ApiMemberDto.SearchResponse> search(
            @PathVariable String type,
            @PathVariable String query,
            @PageableDefault(page = 0, size = 10, sort = "nick", direction = Sort.Direction.ASC) Pageable pageable){
        return ApiResponse.ok(
                ApiMemberDto.SearchResponse.fromResult(
                        memberFacade.search(new ApiMemberDto.SearchRequest(type,query,pageable).toCriteria())
                )
        );
    }

    @PatchMapping("/update")
    public ApiResponse<Void> update(
            @RequestBody ApiMemberDto.UpdateRequest request
    )
    {
        memberFacade.update(request.toCriteria());
        return ApiResponse.ok();
    }

    @PostMapping("/login")
    public ApiResponse<ApiMemberDto.LoginResponse> login(@RequestBody ApiMemberDto.LoginRequest request){
        return ApiResponse.ok(
                ApiMemberDto.LoginResponse.fromResult(
                        memberFacade.login(request.toCriteria())
                )
        );
    }

    @PostMapping("/search/info")
    public ApiResponse<ApiMemberDto.SearchUserInfoResponse> searchUser(@RequestBody ApiMemberDto.SearchUserInfoRequest request){
        System.out.println(request.memberId());
        return ApiResponse.ok(
                ApiMemberDto.SearchUserInfoResponse.fromResult(
                        memberFacade.searchUserInfo(request.toCriteria())
                )
        );
    }

    @PostMapping("/reissue")
    public ApiResponse<ApiMemberDto.ReissueResponse> reissue(@RequestBody ApiMemberDto.ReissueRequest request){
        return ApiResponse.ok(ApiMemberDto.ReissueResponse.fromInfo(memberService.reissue(request.toCommand())));
    }

}
