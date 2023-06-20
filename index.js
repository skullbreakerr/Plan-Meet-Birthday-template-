import './style.css';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  EmailAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import {
  getFirestore,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  where
} from 'firebase/firestore';

import * as firebaseui from 'firebaseui';

const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');
const login = document.getElementById('login');
const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const rsvpCounter = document.getElementById('rsvp-counter'); 
let guestbookListener = null;
let rsvplistener = null;

let db, auth;

async function main() {
  const firebaseConfig = {
    apiKey: 'AIzaSyBB47F-HWZqtBJrzPdCUFUKlIpmqWVAhbk',
    authDomain: 'fir-codelab-acc45.firebaseapp.com',
    projectId: 'fir-codelab-acc45',
    storageBucket: 'fir-codelab-acc45.appspot.com',
    messagingSenderId: '212386950536',
    appId: '1:212386950536:web:c2abcb59208851f56e5e3d',
  };

  initializeApp(firebaseConfig);
  auth = getAuth();
  db = getFirestore();

  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [EmailAuthProvider.PROVIDER_ID],
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        return false;
      },
    },
  };

  const ui = new firebaseui.auth.AuthUI(getAuth());
  login.addEventListener('click', () => {
    ui.start('#firebaseui-auth-container', uiConfig);
  });

  startRsvpButton.addEventListener('click', () => {
    if (auth.currentUser) {
      signOut(auth);
    } else {
      ui.start('#firebaseui-auth-container', uiConfig);
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      startRsvpButton.textContent = 'LOGOUT';
      login.remove(login);
      guestbookContainer.style.display = 'block';
      subscribeGuestbook();
      subscribeCurrentRSVP();
    } else {
      startRsvpButton.textContent = 'log in';
      guestbookContainer.style.display = 'none';
      unsubscribeGuestbook();
      unsubscribeCurrentRSVP();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    addDoc(collection(db, 'guestbook'), {
      text: input.value,
      timestamp: Date.now(),
      name: auth.currentUser.displayName,
      userId: auth.currentUser.uid,
    });

    input.value = '';

    return false;
  });
  const btn1_ctn = document.getElementsByClassName("tooglecontainer")[0];
  const toogleswitch = document.getElementsByClassName("toogleswitch")[0];
  btn1_ctn.addEventListener("click", () => {
    toogleswitch.classList.toggle("transform");
    btn1_ctn.classList.toggle("toogle");
  });

  rsvpCounter.onclick = async() =>{
    const userRef = doc(db,'attendees',auth.currentUser.uid);
    try{
      await setDoc(userRef, {
        attending: true
      });
    }catch(e){
      console.error(e);
    }
  };

  const attendingQuery = query(
    collection(db,'attendees'),
    where('attending','==',true)
  );
  const unregistered = onSnapshot(attendingQuery, snap =>{
    const newCount = snap.docs.length;
    numberAttending.innnerHTML = newCount + 'people going';
  });
   
}
main();

function subscribeGuestbook() {
  const q = query(collection(db, 'guestbook'), orderBy('timestamp', 'desc'));
  guestbookListener = onSnapshot(q, (snaps) => {
    guestbook.innerHTML = '';
    snaps.forEach((doc) => {
      const entry = document.createElement('p');
      entry.textContent = doc.data().name + ': ' + doc.data().text;
      guestbook.appendChild(entry);
    });
  });
}

function unsubscribeGuestbook() {
  if (guestbookListener != null) {
    guestbookListener();
    guestbookListener = null;
  }
}

function subscribeCurrentRSVP(user){
  const ref = doc(db,'attendees', user.uid);
  rsvplistener = onSnapshot(ref,doc => {
    if (doc && doc.data()){
      const attendingResponse = doc.data().attending;
      
      if(attendingResponse){
        rsvpCounter.className='clicked';
      }else{
        rsvpCounter.className='';
      }
    }
  })  
}

function unsubscribeCurrentRSVP(){
  if(rsvplistener != null){
    rsvplistener();
    rsvplistener =null;
  }
  rsvpCounter.className='';
}