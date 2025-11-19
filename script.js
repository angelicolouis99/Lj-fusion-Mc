function login(){
let e=document.getElementById('email').value;
let p=document.getElementById('password').value;
if(e==='angelicolouis99@gmail.com' && p==='angelico@louis'){
document.getElementById('login-box').style.display='none';
document.getElementById('dashboard').classList.remove('hidden');
}else{
document.getElementById('error').innerText='Identifiants incorrects';
}}