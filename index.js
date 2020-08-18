const VIDEO_TYPE = `video/webm`;
const FILENAME = `supertalks.webm`;

const worker = new Worker('./worker.js', { type: "module" });

(() => {
  const video = document.getElementById("video");
  const startCatpureButton = document.getElementById("start-capture-button");
  const stopCatptureButton = document.getElementById("stop-capture-button");
  const showMessageButton = document.getElementById("show-message-button");

  const mediaOptions = {
    video: {
      cursor: `always`,
    },
    audio: false
  };
  const chunks = [];
  let mediaRecorder = null;
  
  startCatpureButton.addEventListener(`click`, async ()  => {
    const mediaStream = await startCapture(mediaOptions);
    video.srcObject = mediaStream;

    video.onplay = () => {
      const stream = video.captureStream();
      mediaRecorder = new MediaRecorder(stream, {mimeType: `${VIDEO_TYPE}; codecs=vp9`});
      mediaRecorder.onstop = () => {
        download(chunks);
      };
      mediaRecorder.ondataavailable = ({data})=>{
        if (data.size > 0) {
          chunks.push(data);
        } 
      };
      mediaRecorder.start(100);
    }
  }, false);
  
  stopCatptureButton.addEventListener(`click`, () => {
    stopCapture(video);
    if(mediaRecorder != null){
      mediaRecorder.stop();
    }
  }, false);

  showMessageButton.addEventListener(`click`, () => {
    worker.postMessage({message: "Bem vindo ao WebAssembly!!!"});
  }, false);

})();

const  startCapture = async (mediaOptions)  =>  {
  try {
    const captureStream = await navigator.mediaDevices.getDisplayMedia(mediaOptions);
    return captureStream;
  } catch(err) {
    console.error(`startCapture error  >> ${err}`);
    return null;
  }
};

const stopCapture = (video) => {
  try{
    const tracks = video.srcObject.getTracks();
    for (let i = 0; i <= tracks.length; i++) {
      ((i) => {
        const track = tracks[i];
        if(track){
          track.stop();
        }
      })(this, i);
    }
    video.srcObject = null;
  }catch(err){
    console.error(`stopCapture error  >> ${err}`);
  }
};


const download = (chunks) => {
  const blob = new Blob(chunks, {
    type: VIDEO_TYPE
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';
  a.href = url;
  a.download = 'supertalks.webm';
  a.click();
  window.URL.revokeObjectURL(url);
};




