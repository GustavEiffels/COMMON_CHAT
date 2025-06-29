package com.com_chat.user.domain.member;

import com.com_chat.user.support.exceptions.BaseException;
import com.com_chat.user.support.jwt.JwtHandler;
import com.com_chat.user.support.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import static org.springframework.util.StringUtils.hasText;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final MemberRepository repository;
    private final JwtHandler jwtHandler;


// SIGNUP
    public DomainMemberDto.SignUpInfo create(DomainMemberDto.SignUpCommand command){

        if( repository.findByNick(command.nick()).isPresent() ){
            throw new BaseException(MemberException.ALREADY_EXIST_NICK);
        }
        if( repository.findByEmail(command.email()).isPresent() ){
            throw new BaseException(MemberException.ALREADY_EMAIL_NICK);
        }
        return DomainMemberDto.SignUpInfo.fromDomain(
                repository.save(
                        command.toDomain(
                                passwordEncoder.encode(
                                        command.password()
                                )
                        )
                )
        );
    }

// SEARCH
    public DomainMemberDto.SearchInfo search(DomainMemberDto.SearchCommand command){
        return DomainMemberDto.SearchInfo.fromDomain(
                repository.findByQuery(
                        command.type(),
                        command.query(),
                        command.pageable()
                )
        );
    }

    public void existMember(Long memberId){
        if ( repository.find(memberId).isEmpty() ){
            throw new BaseException(MemberException.NOT_EXIST);
        }
    }

// UPDATE
    public void update(DomainMemberDto.UpdateCommand command){
        Optional<Member> findMember = repository.find(command.memberId());

        if ( findMember.isEmpty() ){
            throw new BaseException(MemberException.NOT_EXIST);
        }

        Member changeMember = findMember.get();
        if ( hasText(command.password()) ){
            changeMember = changeMember.changePassword(passwordEncoder.encode(command.password()));
        }
        if ( hasText(command.profilePath()) ){
            changeMember = changeMember.changeProfilePath(command.profilePath());
        }

        repository.save(changeMember);
    }

// LOGIN
    public DomainMemberDto.LoginInfo login(DomainMemberDto.LoginCommand command){
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(command.email(),command.password())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Member member = userDetails.getMemberEntity().toDomain();

        String accessToken  = jwtHandler.createAccessToken(member.memberId());
        String refreshToken = jwtHandler.createRefreshToken(member.memberId());
        repository.save(member.refresh(refreshToken));

        return new DomainMemberDto.LoginInfo(member.memberId(),accessToken,refreshToken,member.nick());
    }

    public DomainMemberDto.MemberNickInfo findMemberInfo(List<Long> memberIds){
        return new DomainMemberDto.MemberNickInfo(
                repository.findMembers(memberIds).stream()
                        .map(member -> new DomainMemberDto.MemberNickDto(
                                member.memberId(),
                                member.nick()))
                        .toList());
    }

    public DomainMemberDto.MemberNickDto findMemberInfo(Long memberId){
        Optional<Member> optionalMember = repository.find(memberId);

        if ( optionalMember.isEmpty() ){
            throw new BaseException(MemberException.NOT_EXIST);
        }

        return new DomainMemberDto.MemberNickDto(optionalMember.get().memberId(), optionalMember.get().nick());
    }

// FIND
    public DomainMemberDto.AuthenticationInfo findAuthenticationMember(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if( authentication != null && authentication.isAuthenticated() ){
            return new DomainMemberDto.AuthenticationInfo((Long) authentication.getPrincipal());
        }
        throw new BaseException(MemberException.NOT_AUTHENTICATION_MEMBER);
    }

// REISSUE
    public DomainMemberDto.ReissueInfo reissue(DomainMemberDto.ReissueCommand command){

        // Member Id from Refresh Token
        Long memberId = jwtHandler.getMemberId(command.refreshToken());

        // Find Member By Refresh Token
        Member findMember = repository.findByRefresh(command.refreshToken())
                .orElseThrow(()->new BaseException(MemberException.NOT_EXIST));

        // Compare With Id
        if( !findMember.memberId().equals(memberId) ){
            throw new BaseException(MemberException.NOT_MATCHED_USER);
        }

        // Generate New Access Token
        return new DomainMemberDto.ReissueInfo(jwtHandler.createAccessToken(memberId));
    }

}
