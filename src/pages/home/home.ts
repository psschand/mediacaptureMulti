import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MediaCapture, MediaFile, CaptureError, CaptureVideoOptions } from '@ionic-native/media-capture';
import { Storage } from '@ionic/storage';
import { Media, MediaObject } from '@ionic-native/media';
import { File } from '@ionic-native/file';
import { NativeAudio } from '@ionic-native/native-audio';
import { FileChooser } from '@ionic-native/file-chooser';
import { Platform } from 'ionic-angular';
import { FilePath } from '@ionic-native/file-path';

const MEDIA_FILES_KEY = 'mediaFiles';
 
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
   providers: [File,FileChooser,NativeAudio]
})
export class HomePage {
  mediaFiles = [];
  @ViewChild('myvideo') myVideo: any;
    indexedArray: {[key: string]: string}={ "a":"a1","b":"b1","c":"c1"};
    tracks: any;
    players: any;
    playing: boolean = true;
    currentTrack: any;
    progressInterval: any;
  constructor(public navCtrl: NavController, private mediaCapture: MediaCapture, private storage: Storage, private file: File, private media: Media,public nativeAudio: NativeAudio,    private fileChooser: FileChooser,private filePath: FilePath,public platform: Platform) 
  {

  //var indexedArray: {[key: string]: string}={ "a":"a1","b":"b1","c":"c1"};
//   this.tracks = [
//     {title: 'Something About You', artist: 'ODESZA', playing: false, progress: 0},
//     {title: 'Run', artist: 'Allison Wonderland', playing: false, progress: 0},
//     {title: 'Breathe', artist: 'Seeb Neev', playing: false, progress: 0},
//     {title: 'HyperParadise', artist: 'Hermitude', playing: false, progress: 0},
//     {title: 'Lifespan', artist: 'Vaults', playing: false, progress: 0},
//     {title: 'Stay High', artist: 'Tove Lo', playing: false, progress: 0},
//     {title: 'Lean On', artist: 'Major Lazer', playing: false, progress: 0},
//     {title: 'They Say', artist: 'Kilter', playing: false, progress: 0}
// ];

this.tracks = [ {fpath:"0",volume:1,loop:true,name: 'Something About You0', ob: 'ODESZA', playing: false, progress: 0,localURL:""}];
this.players = [
  {fpath:"0",volume:1,loop:true,name: 'Something About You0', ob: 'ODESZA', playing: false, progress: 0,localURL:""},
  {fpath:"1",volume:1,loop:true,name: 'Something About You1', ob: 'ODESZA', playing: false, progress: 0,localURL:""},
  {fpath:"2",volume:1,loop:true,name: 'Something About You2', ob: 'ODESZA', playing: false, progress: 0,localURL:""},
  {fpath:"3",volume:1,loop:true,name: 'Something About You3', ob: 'ODESZA', playing: false, progress: 0,localURL:""}
];



this.currentTrack = this.tracks[0];


  }
  
  onSuccessPreloading = data => {
    console.log("success preloading", data);
    //this.nativeAudio.play("track1").then(this.onSuccessPlaying, this.onError);
  };

  onError = data => {
    console.log("error preloading", data);
    alert(data)
    //this.nativeAudio.play("track1").then(this.onSuccessPlaying, this.onError);
  };

  ionViewDidLoad() {
    this.storage.get(MEDIA_FILES_KEY).then(res => {
      this.mediaFiles = JSON.parse(res) || [];
    })
  }
 
  captureAudio() {
    this.mediaCapture.captureAudio().then(res => {
      this.storeMediaFiles(res);
    }, (err: CaptureError) => console.error(err));
  }
 
  captureVideo() {
    let options: CaptureVideoOptions = {
      limit: 1,
      duration: 30
    }
    this.mediaCapture.captureVideo(options).then((res: MediaFile[]) => {
      let capturedFile = res[0];
      let fileName = capturedFile.name;
      let dir = capturedFile['localURL'].split('/');
      dir.pop();
      let fromDirectory = dir.join('/');      
      var toDirectory = this.file.dataDirectory;
      
      this.file.copyFile(fromDirectory , fileName , toDirectory , fileName).then((res) => {
        this.storeMediaFiles([{name: fileName, size: capturedFile.size}]);
      },err => {
        console.log('err: ', err);
      });
          },
    (err: CaptureError) => console.error(err));
  }
 
  play(myFile) {
    //alert(myFile)
    if (myFile.name.indexOf('.wav') > -1 || myFile.name.indexOf('.amr') > -1 ) {
      const audioFile: MediaObject = this.media.create(myFile.localURL);
      audioFile.play();
      
      audioFile.onStatusUpdate.subscribe((statusCode)=> {
        if(statusCode == 4)//4 is the statusCode which is passed when the media is finished playing
        {
            //play the song again (if in loop).
            this.play(myFile);
        }
    });
    } else {
      alert("video")
      let path = this.file.dataDirectory + myFile.name;
      let url = path.replace(/^file:\/\//, '');
      let video = this.myVideo.nativeElement;
      video.src = url;
      video.play();
    }
  }
 
  play2(myFile,n:number) {

      this.nativeAudio.preloadComplex(n.toString(), myFile, 1, 1, 0).then(this.onSuccessPreloading, this.onError);
      //this.nativeAudio.loop(myFile).then(this.onSuccessPreloading, this.onError);
     // const audioFile: MediaObject = this.media.create(myFile.localURL);
      //audioFile.play();
    
  }

  private captureFile(n:number): Promise<any> {
    //if(this.platform.is("cordova"))
    //{
    return new Promise((resolve, reject) => {
              this.fileChooser.open().then((uri) => {
                //alert(uri) 
                  this.filePath.resolveNativePath(uri)
                      .then((filePath) => {
                        
                           
                          this.players[n].fpath=filePath,
                          this.players[n].localURL=filePath,
                          this.players[n].name=filePath
                         // alert(this.players[n].localURL)
                                       const audioFile: MediaObject = this.media.create(filePath);
                          audioFile.play();
                          this.players[n].ob=audioFile;
                          var p = {fpath:filePath,volume:1,loop:true,name: filePath, ob:audioFile, playing: true, progress: 0,localURL:filePath};
                          this.tracks.push(p);
                          audioFile.onStatusUpdate.subscribe((statusCode)=> {
                            if(statusCode == 4)//4 is the statusCode which is passed when the media is finished playing
                            {
                                //play the song again (if in loop).
                               audioFile.play();
                            }
                        });
                          
                      }, (err) => {
                          reject(err);
                      })
              }, (err) => {
                  reject(err);
              });
  
          });
      //  }
      }
  
      private captureFile2(n:number): Promise<any> {
        //if(this.platform.is("cordova"))
        //{
        return new Promise((resolve, reject) => {
                  this.fileChooser.open().then((uri) => {
                    //alert(uri) 
                      this.filePath.resolveNativePath(uri)
                          .then((filePath) => {
                            
                               
                              this.players[n].fpath=filePath,
                              this.players[n].localURL=filePath,
                              this.players[n].name=filePath
                             // alert(this.players[n].localURL)
                             
                              const audioFile: MediaObject = this.media.create(filePath);
                              audioFile.play();
                              audioFile.setVolume(0.5),
                              this.players[n].ob=audioFile,
                              audioFile.onStatusUpdate.subscribe((statusCode)=> {
                                if(statusCode == 4)//4 is the statusCode which is passed when the media is finished playing
                                {
                                    //play the song again (if in loop).
                                    audioFile.play();
                                }
                            });
                              
                          }, (err) => {
                              reject(err);
                          })
                  }, (err) => {
                      reject(err);
                  });
      
              });
          //  }
          }
      
vplus(audio){
if(audio.volume<1){
  audio.volume=audio.volume+0.49;
  const aF: MediaObject =audio.ob
  aF.setVolume(audio.volume)
}

}
          
vminus(audio){
  if(audio.volume>0){
    audio.volume=audio.volume-0.49
    const aF: MediaObject =audio.ob
    aF.setVolume(audio.volume)
  }
  
  }
  stop(audio){
    const aF: MediaObject =audio.ob
    aF.pause();
   
    //audio.ob.stop()
    }

    pop(audio){
      const aF: MediaObject =audio.ob
      aF.stop();
      aF.pause();
     aF.release();
   
      //audio.ob.release()
      this.tracks.pop(audio)
      }

  storeMediaFiles(files) {
    this.storage.get(MEDIA_FILES_KEY).then(res => {
      if (res) {
        let arr = JSON.parse(res);
        arr = arr.concat(files);
        this.storage.set(MEDIA_FILES_KEY, JSON.stringify(arr));
      } else {
        this.storage.set(MEDIA_FILES_KEY, JSON.stringify(files))
      }
      this.mediaFiles = this.mediaFiles.concat(files);
    })
  }
}

