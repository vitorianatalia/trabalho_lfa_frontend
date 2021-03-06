import { displayTupla, acceptsWord, clearAcceptButton, loadingScreen, displayGraph } from './uxfunctions.js'

import { getCookie, setCookie } from './cookieHandler.js'

var user_session = getCookie('user_session');
if (!user_session) {
    setCookie();
}

var fileChooser = document.getElementById('docpicker');
var loadButton = document.querySelector('.submit-automata-btn');
var loadedFile;
var loadedFileName;
let automataOption;

function waitForTextReadComplete(reader) {
    reader.onloadend = function (event) {
        loadedFile = event.target.result;
        console.log("loaded")
        var fnSpan = document.createElement("span");
        fnSpan.innerText = loadedFileName;
        if (document.querySelector('.filename')) {
            document.querySelector('.filename').remove();
            
        }
        fnSpan.classList.add("filename")
        var select = document.querySelector(".docpicker-label")
        select.appendChild(fnSpan);

        document.querySelector('.docpicker-label span').classList.add('hide');
    }
}

function handleFileSelection() {
    var file = fileChooser.files[0],
        reader = new FileReader();
    waitForTextReadComplete(reader);
    reader.readAsText(file);
    loadedFileName = file.name.toLowerCase();
}

fileChooser.addEventListener('change', handleFileSelection, false);

loadButton.addEventListener('click', handleSubmit);

function handleSubmit() {
    if (document.querySelector('.btn-clicked'))
        automataOption = document.querySelector('.btn-clicked').innerText.toLowerCase();
    if (loadedFile && automataOption) {
        document.querySelector('.error-warning').classList.add('hidden');
        sendXML(loadedFile, automataOption);
    }
    else {
        if (document.querySelector('.error-warning.hidden'))
            document.querySelector('.error-warning.hidden').classList.remove('hidden');
    }
}


function sendXML(xml, option) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "text/plain");
    myHeaders.append("Accept", "*/*");

    var raw = xml;
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    postReq(requestOptions, option);
    getGraph(option);
}

async function postReq(requestOptions, option) {
    loadingScreen(true);
    await fetch(`https://trabalho-lfa.herokuapp.com/${option}/load-${option}?uuid=${user_session}`, requestOptions)
        .then(response => response.text())
        .then(result => displayTupla(result))
        .catch(error => console.log('error', error));
    loadingScreen(false)
}

async function getGraph(option) {
    loadingScreen(true);
    let dotLanguageString;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "text/plain");
    myHeaders.append("Accept", "*/*");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    await fetch(`https://trabalho-lfa.herokuapp.com/${option}/getDot?uuid=${user_session}`, requestOptions)
        .then(response => response.text())
        .then(result => {dotLanguageString = result})
        .catch(error => console.log('error', error));

    await fetch(`https://quickchart.io/graphviz?graph=${dotLanguageString}`, requestOptions)
        .then(response => response.text())
        .then(result => displayGraph(result))
        .catch(error => console.log('error', error));

    loadingScreen(false)
}


document.getElementById('automata-word').addEventListener('input', handleWordTyped)

async function handleWordTyped(event) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "text/plain");
    myHeaders.append("Accept", "*/*");

    var userWord = event.target.value;
    var flag = userWord != '' ? true : false;
    clearAcceptButton(flag);
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };
    if (automataOption && loadedFile && userWord != '') {
    await fetch(`https://trabalho-lfa.herokuapp.com/${automataOption}/accepts?uuid=${user_session}&wordString=${userWord}`, requestOptions)
        .then(response => response.text())
        .then(result => acceptsWord(result, flag))
        .catch(error => console.log('error', error));
    }
}

