document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#compose-form').addEventListener("submit", function(e) {
    e.preventDefault()
    const recipient = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients: recipient,
        subject: subject,
        body: body
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
    });
    load_mailbox('sent');
    return false;
})
});

function archive(email) {
  if (email["archived"] === false){
    fetch(`/emails/${email["id"]}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
    load_mailbox('inbox')
  }
  else{
    fetch(`/emails/${email["id"]}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
    load_mailbox('inbox')
  }
}

function email_content(email) {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-content').style.display = 'block';

    document.querySelector('#content').innerHTML= '';
    document.querySelector('#answer').innerHTML= '';
    document.querySelector('#bttn').innerHTML= '';

    fetch(`/emails/${email["id"]}`)
    .then(response => response.json())
    .then(data => {
      console.log(`${data["sender"]}`)
      const element = document.createElement('div');
      element.innerHTML = `
      <div class="container">
        <div class="info">
        <div class="obj-1"><strong>From:</strong> ${data["sender"]}</div>
        <div class="obj-1"><strong>To:</strong> ${data["recipients"]}</div>
        <div class="obj-2"><strong>Subject:</strong> ${data["subject"]}</div>
        <div class="obj-3"><strong>Date/Time:</strong> ${data["timestamp"]}</div>
        </div>
        <hr class="wr">
        </div>
        <div class="content">
          <p>${data["body"]}</p>
        </div>`
        ;
      const answb = document.createElement('div');
      answb.innerHTML = `
      <button id="reply" class="btn btn-outline-primary cvb">Reply</button>
      `
      ;
      answb.addEventListener('click', function() {
        console.log('This element has been clicked!')
        reply(email)
      });
      document.querySelector('#answer').append(answb);
      document.querySelector('#content').append(element);
    })

    if (email["read"] === false) {
      fetch(`/emails/${email["id"]}`, {
        method: "PUT",
        body : JSON.stringify({
          read: true
        })
    })
    }

    if (email["archived"] === false) {
      fetch(`/emails/${email["id"]}`)
      .then(response => response.json())
      .then(data => {
        const btn = document.createElement('div');
        btn.innerHTML = `
        <button value=${email["id"]} id="archive" class="btn btn-outline-secondary vbn">Archive</button>
        `
        ;
        btn.addEventListener('click', function(){
          archive(email)
        })
        document.querySelector('#bttn').append(btn);
      })
    }
    else {
      fetch(`/emails/${email["id"]}`)
      .then(response => response.json())
      .then(data => {
        const btn = document.createElement('div');
        btn.innerHTML = `
        <button value=${email["id"]} id="archive" class="btn btn-outline-secondary vbn">Unarchive</button>
        `
        ;
        btn.addEventListener('click', function(){
          archive(email)
        })
        document.querySelector('#bttn').append(btn);
      })
    }

  }

  


function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-content').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
}

function answer_email() {
  // Show answer view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-content').style.display = 'none';

}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (mailbox === "archive") {
      fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .then(emails => {
          let archiveds = emails.filter(email => email.archived === true)
          archiveds.forEach(archived => {
            const element = document.createElement('div');
            element.innerHTML = `
            <div class="container">
              <div class="box">
              <div class="obj-1"><strong>From:</strong> ${archived["sender"]}</div>
              <div class="obj-2"><strong>Subject:</strong> ${archived["subject"]}</div>
              <div class="obj-3"><strong>Date/Time:</strong> ${archived["timestamp"]}</div>
              </div>
            </div>`;
            element.style.backgroundColor = "gray";
            element.addEventListener('click', function() {
              console.log('This element has been clicked!')
              email_content(archived)
            });
            document.querySelector('#emails-view').append(element);
            })
      });    
  }

  else { 
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      let mails = emails.filter(email => email.archived === false)
     mails.forEach(mail => {
      const element = document.createElement('div');
      element.innerHTML=
            `<div class="container">
            <div class="box">
            <div class="obj-1"><strong>From:</strong> ${mail["sender"]}</div>
            <div class="obj-2"><strong>Subject:</strong> ${mail["subject"]}</div>
            <div class="obj-3"><strong>Date/Time:</strong> ${mail["timestamp"]}</div>
            </div>
          </div>`;
          if (mail["read"] === true){
            console.log("gray")
            element.style.backgroundColor = "gray";
          }
          else {
            element.style.backgroundColor = "white";
          }
          element.addEventListener('click', function() {
            console.log('This element has been clicked!')
            email_content(mail)
          });
          document.querySelector('#emails-view').append(element);
        }) 
      });
    }
}

function reply(email) {
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  fetch(`/emails/${email["id"]}`)
  .then(response => response.json())
  .then(data => {
    const sender = data["sender"]
    const subject = data["subject"]
    const timestamp = data["timestamp"]
    const body = data["body"]
    const substring = "Re:"
    document.getElementById('compose-recipients').value = `${sender}`
    if (subject.includes(substring)){
      document.getElementById('compose-subject').value = `${subject}`
    }
    else{
      document.getElementById('compose-subject').value = `Re: ${subject}`
    }
    document.getElementById('compose-body').value = `On ${timestamp} ${sender} wrote: ${body}`
  });
  answer_email()
};


