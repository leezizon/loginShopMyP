const supabaseUrl = 'https://ovmroczkeblnuseyaosj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bXJvY3prZWJsbnVzZXlhb3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4NDc1MDEsImV4cCI6MjA0MzQyMzUwMX0.IUcxnOltjuM0Nk6bv0qD6ff7DMimHL_xkhvRDeyAuKA';
const supauser = supabase.createClient(supabaseUrl, supabaseKey);

let currentPImg = new Image;
currentPImg.className='profileImg';

fetch('/checkPofile',{ method: 'POST',body:''}) // '/query' 엔드포인트를 호출
.then(response => response.json())
.then(data => {
    if(data){
        const { data: publicURL } = supauser.storage.from('palyList').getPublicUrl(`user/profileImg/${data.whoN}/img.png`);
        currentPImg.src = publicURL.publicUrl;

        document.getElementById('userSState').innerHTML = `<img src=${publicURL.publicUrl} alt="Profile Picture" /> `+data.who ;
    }
})
