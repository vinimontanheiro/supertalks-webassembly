let videoWidth, videoHeight;
let streaming = false;
let stream = null;
let faceClassifier = null;
let eyeClassifier = null;
let src = null;
let dstC1 = null;
let dstC3 = null;
let dstC4 = null;
let canvasInput = null;
let canvasInputCtx = null;
let canvasBuffer = null;
let canvasBufferCtx = null;
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const canvasCTX = canvas.getContext('2d');
const detectFace = document.getElementById('face');
const detectEye = document.getElementById('eye');

const startCamera = async () => {
  if (streaming) return;
  const mediaStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
  stream = mediaStream;
  video.srcObject = mediaStream;
  video.play();

  video.addEventListener("canplay", () =>{
    if (!streaming) {
      videoWidth = video.videoWidth;
      videoHeight = video.videoHeight;
      video.setAttribute("width", videoWidth);
      video.setAttribute("height", videoHeight);
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      streaming = true;
    }
    startVideoProcessing();
  }, false);
}

const startVideoProcessing = () => {
  if (!streaming) { console.warn("startVideoProcessing error"); return; }
  stopVideoProcessing();
  canvasInput = document.createElement('canvas');
  canvasInput.width = videoWidth;
  canvasInput.height = videoHeight;
  canvasInputCtx = canvasInput.getContext('2d');
  canvasBuffer = document.createElement('canvas');
  canvasBuffer.width = videoWidth;
  canvasBuffer.height = videoHeight;
  canvasBufferCtx = canvasBuffer.getContext('2d');
  srcMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
  grayMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC1);
  faceClassifier = new cv.CascadeClassifier();
  faceClassifier.load('haarcascade_frontalface_default.xml');
  eyeClassifier = new cv.CascadeClassifier();
  eyeClassifier.load('haarcascade_eye.xml');
  requestAnimationFrame(processVideo);
}

const processVideo = () => {
  stats.begin();
  canvasInputCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
  let imageData = canvasInputCtx.getImageData(0, 0, videoWidth, videoHeight);
  srcMat.data.set(imageData.data);
  cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);
  let faces = [];
  let eyes = [];
  let size;
  if (detectFace.checked) {
    let faceVect = new cv.RectVector();
    let faceMat = new cv.Mat();
    if (detectEye.checked) {
      cv.pyrDown(grayMat, faceMat);
      size = faceMat.size();
    } else {
      cv.pyrDown(grayMat, faceMat);
      cv.pyrDown(faceMat, faceMat);
      size = faceMat.size();
    }
    faceClassifier.detectMultiScale(faceMat, faceVect);
    for (let i = 0; i < faceVect.size(); i++) {
      let face = faceVect.get(i);
      faces.push(new cv.Rect(face.x, face.y, face.width, face.height));
      if (detectEye.checked) {
        let eyeVect = new cv.RectVector();
        let eyeMat = faceMat.getRoiRect(face);
        eyeClassifier.detectMultiScale(eyeMat, eyeVect);
        for (let i = 0; i < eyeVect.size(); i++) {
          let eye = eyeVect.get(i);
          eyes.push(new cv.Rect(face.x + eye.x, face.y + eye.y, eye.width, eye.height));
        }
        eyeMat.delete();
        eyeVect.delete();
      }
    }
    faceMat.delete();
    faceVect.delete();
  } else {
    if (detectEye.checked) {
      let eyeVect = new cv.RectVector();
      let eyeMat = new cv.Mat();
      cv.pyrDown(grayMat, eyeMat);
      size = eyeMat.size();
      eyeClassifier.detectMultiScale(eyeMat, eyeVect);
      for (let i = 0; i < eyeVect.size(); i++) {
        let eye = eyeVect.get(i);
        eyes.push(new cv.Rect(eye.x, eye.y, eye.width, eye.height));
      }
      eyeMat.delete();
      eyeVect.delete();
    }
  }
  canvasCTX.drawImage(canvasInput, 0, 0, videoWidth, videoHeight);
  draw(canvasCTX, faces, '#04ff00', size);
  draw(canvasCTX, eyes, '#fc1b1b', size);
  stats.end();
  requestAnimationFrame(processVideo);
}

const draw = (ctx, results, color, size) =>{
  for (let i = 0; i < results.length; ++i) {
    let rect = results[i];
    let xRatio = videoWidth/size.width;
    let yRatio = videoHeight/size.height;
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.strokeRect(rect.x*xRatio, rect.y*yRatio, rect.width*xRatio, rect.height*yRatio);
  }
}

const stopVideoProcessing = () => {
  if (src != null && !src.isDeleted()) src.delete();
  if (dstC1 != null && !dstC1.isDeleted()) dstC1.delete();
  if (dstC3 != null && !dstC3.isDeleted()) dstC3.delete();
  if (dstC4 != null && !dstC4.isDeleted()) dstC4.delete();
}

const stopCamera = () => {
  if (!streaming) return;
  stopVideoProcessing();
  document.getElementById("canvas").getContext("2d").clearRect(0, 0, width, height);
  video.pause();
  video.srcObject=null;
  stream.getVideoTracks()[0].stop();
  streaming = false;
}

const init = () =>{
  stats = new Stats();
  stats.showPanel(0);
  document.getElementById('container').appendChild(stats.dom);
}

const isReady = async () => {
  init();
  await startCamera();
}