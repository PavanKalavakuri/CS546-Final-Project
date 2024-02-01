const socket = io("/");
const peer = new Peer();

let myVideoStream;
let mysocketId;
var videoGrid = document.getElementById("videoDiv");
var myVideo = document.createElement("video");
myVideo.setAttribute("id", "myVideoId")
myVideo.muted = true;
const peersConnections = {};



// Get the user’s webcam stream using the getUserMedia() method.
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  //Add Client video element to the DOM and sets its srcObject to the stream.
  .then((stream) => {
    myVideoStream = stream;
    addVideo(myVideo, stream); 
    peer.on("call", (call) => {
      call.answer(stream);
      const vid = document.createElement("video"); 
      call.on("stream", (userStream) => {
        addVideo(vid, userStream);
      });
      call.on("error", (err) => {
        alert(err);
      });
      call.on("close", () => {
        console.log(vid);
        vid.remove();
      });
      peersConnections[call.peer] = call; 
    });
  })
  // Create a peer connection using the RTCPeerConnection() method
  .catch((err) => {
    alert(err.message);
  });

peer.on("open", (id) => {
  mysocketId = id;
  socket.emit("createNewUsers", id, roomID);
});


peer.on("error", (err) => {
  alert(err.type);
});

socket.on("userJoinsRoom", (id) => {
  console.log("new user joined");
  const call = peer.call(id, myVideoStream);
  const vid = document.createElement("video");

  call.on("error", (err) => {
    alert(err); 
  });

  // When the `stream` event is triggered, it will use addVideo function and pass `vid` and `userStream` as arguments to load the stream in video tag.
  call.on("stream", (userStream) => {
    addVideo(vid, userStream);
  });

// When the `close` event is triggered, it will use remove the video.
  call.on("close", () => {
    vid.remove();
    console.log("user disconect");
  });

  peersConnections[id] = call;
});


socket.on("userDisconnects", (id) => {
  if (peersConnections[id]) {
    peersConnections[id].close();
  }
});


function addVideo(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play(); // This will play the video when the video tag's metadata is loaded.
  });
  videoGrid.append(video);
}
