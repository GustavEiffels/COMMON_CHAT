package com.com_chat.user.interfaces.chatroom;


import com.com_chat.user.application.room.RoomFacade;
import com.com_chat.user.support.exceptions.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/rooms")
public class RoomController {

    private final RoomFacade roomFacade;

    @PostMapping("")
    public ApiResponse<ApiRoomDto.CreateResponse> create(
            @RequestBody ApiRoomDto.CreateRequest request
    ){
        return ApiResponse.ok(
                ApiRoomDto.CreateResponse.fromResult(
                        roomFacade.createRoom(request.toCriteria())
                )
        );
    }
}
