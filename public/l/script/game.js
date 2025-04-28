
export var userList = [];
export var userRoom = 'asd';//룸이름
export var userMe = 'asd'; //사용자키 


export const socket = io();


//프로필 선택 버튼
document.getElementById('asd').addEventListener('click', function(e){
    playedScorePop('asd');
});

document.getElementById('rew').addEventListener('click',function(e){
    playedScorePop('rew');
});

document.getElementById('zxc').addEventListener('click',function(e){
    playedScorePop('zxc');
});


//사용자키 확인버튼
document.getElementById('meButton').addEventListener('click',function(e){
    alert(userMe);
});

//방선택 함수
function playedScorePop(name){
    var buttons = document.getElementById("buttons");
    buttons.parentNode.removeChild(buttons);
    userRoom = name;
    //방참가
    socket.emit("room",name);
    document.getElementById('chatLog').classList.toggle("hidden-canvas");
        
}


////유저관리///
// 유저 생성 함수
function createUser(id, x, y) {
    userList.push({ id, x, y, width: 100, height: 100, speed: 200});
    console.log(userList.length);
    console.log(id+'생성됨');
}
//기존유저 생성
socket.on("guestList", (guest,userListt)=>{
    alert(guest);
    userMe = guest;
    //기존유저생성
    createUser(guest,50,50);
    for (let i = userListt.length - 1; i >= 0; i--){
        createUser(userListt[i].id,userListt[i].x,userListt[i].y);
    }
    //guestList에서 나를 포함한 유저리스트를 보냄
    socket.emit("updateGuestListOne",userList);
});

//실시간서버수신
socket.on("updateGuestList", (List)=>{
    console.log('업데이트됩니다');
    userList = List;
});

//누군가 나갔을 때 서버수신
socket.on("bye",(id) =>{
    //유저리스트 제외
    for (let i = userList.length - 1; i >= 0; i--){
        if(userList[i].id === id){
            userList.splice(i,1);
        }
    }
    socket.emit("updateGuestListOne",userList);
    console.log('누군가 나감');
    console.log(userList);
});




/////메세지처리///
//메세지를 백엔드에서 프론트로받음
socket.on("talkF",(sentence, nic)=>{
    // 부모 요소 선택
    var chatElement = document.querySelectorAll('.chatLog');
    // 새로운 <div> 추가
    chatElement[0].insertAdjacentHTML("beforeend", `<div class="display-flex"><div>${nic} :</div><div class="talk">${sentence}</div></div>`);
})


document.querySelector('#send').addEventListener('click',function(e){
    // 문장 가져오기
    let sentenceElement = document.getElementById('sentenceEdit');
    let sentence = sentenceElement ? sentenceElement.value : ''; // sentenceElement가 없으면 빈 문자열 반환
    sentenceElement.value = '';
    //메세지를 백엔드로 송신
    socket.emit("talkB",sentence, userMe);
})

document.querySelector('#sentenceEdit').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        // 문장 가져오기
        let sentenceElement = document.getElementById('sentenceEdit');
        let sentence = sentenceElement ? sentenceElement.value : ''; // sentenceElement가 없으면 빈 문자열 반환
        sentenceElement.value = '';
        //메세지를 백엔드로 송신
        socket.emit("talkB",sentence, userMe);
    }
});