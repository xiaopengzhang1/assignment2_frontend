import {Component, OnInit} from '@angular/core';
import {WebSocketService} from '../websocket.service';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.css']
})
export class ChatroomComponent implements OnInit {
  GroupList: any = [];
  MessageList = [];
  message = '';
  sendData = {};
  currentChannelID = '';
  wsService = new WebSocketService();
  userinfo = {
    username: '',
    avatar: ''
  };
  msgImg: '';

  constructor(private http: HttpClient, private router: Router) {
  }

  ngOnInit() {
    this.initSocket();
    this.checkLogin();
    this.initGroup();
  }


  switchGroup(e, id) {
    e.preventDefault();
    this.loadChannel(id);
    for (const i of this.GroupList) {
      if (i._id === id) {
        i.active = !i.active;
      }
    }
  }


  logout() {
    localStorage.setItem('userinfo', '');
    this.router.navigate(['login']);
  }

  switchChannel(e, id) {
    e.preventDefault();
    this.leavingChannel();
    this.currentChannelID = id;
    this.loadRecord();
    for (const i of this.GroupList) {
      if (i.channelList) {
        for (const j of i.channelList) {
          j.active = j._id === id;
        }
      }
    }
  }


  loadRecord() {
    this.http.get(`http://127.0.0.1:3000/channel/${this.currentChannelID}`)
      .toPromise()
      .then((data: any) => {
        this.MessageList = data;
        this.joinChannel();

      })
      .catch(err => {
        console.log(err);
      });
  }

  initSocket() {
    this.wsService.createObservableSocket('ws://127.0.0.1:8085').subscribe(
      data => {
        this.handleSocket(data.type, data.data, data);
      },
      err => console.log(err),
      () => console.log('流已经结束') //  最后结束后，会执行到这的
    );
  }

  initGroup() {
    this.http.get('http://127.0.0.1:3000/group')
      .toPromise()
      .then(data => {
        this.GroupList = data;
      })
      .catch(err => {
        console.log(err);
      });
  }

  loadChannel(groupid) {
    this.http.get('http://127.0.0.1:3000/group/' + groupid)
      .toPromise()
      .then(data => {
        for (const i of this.GroupList) {
          if (i._id === groupid) {
            i.channelList = data;
            break;
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleSocket(type, data, orginData) {
    if (type === 'message') {
      this.onSendMsg(orginData);
    } else if (type === 'tip') {
      this.onSendMsg(orginData);
    }
  }

  checkLogin() {
    if (!localStorage.getItem('userinfo')) {
      this.router.navigate(['login']);
    } else {
      this.userinfo = JSON.parse(localStorage.getItem('userinfo'));

    }
  }

  onSendMsg(data) {
    this.MessageList.push(data);
  }

  sendMsg(e) {
    e.preventDefault();
    if (this.currentChannelID) {
      this.sendData = {
        type: 'message',
        channelID: this.currentChannelID,
        data: {
          user: this.userinfo,
          message: this.message,
          type: 'message',
          image: this.msgImg
        }
      };
      this.wsService.sendMessage(this.sendData);
      this.message = '';
      this.msgImg = '';
    } else {
      alert('Please choose a channel first');
    }
  }

  joinChannel() {
    this.sendData = {
      type: 'tip',
      channelID: this.currentChannelID,
      data: {
        message: `${this.userinfo.username} join`,
        type: 'tip'
      }
    };
    this.wsService.sendMessage(this.sendData);
  }

  leavingChannel() {
    this.sendData = {
      type: 'tip',
      channelID: this.currentChannelID,
      data: {
        message: `${this.userinfo.username} left`,
        type: 'tip'
      }
    };
    this.wsService.sendMessage(this.sendData);
  }

  fileChange(e) {
    const reader = new FileReader();
    const file = e.srcElement.files[0];
    reader.readAsDataURL(file);
    const self = this;
    // tslint:disable-next-line:only-arrow-functions no-shadowed-variable
    reader.onload = function(e: any) {
      self.msgImg = e.target.result;
    };
    self.msgImg = e.target.result;
  }
}

