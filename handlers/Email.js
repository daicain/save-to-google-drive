var email = require('emailjs');
function Email() {
    this.to = undefined;
    this.from = undefined;
    this.subject = undefined;
    this.message = undefined;

    this.getTo = () => this.to;
    this.getFrom = () => this.from;
    this.getSubject = () => this.subject;
    this.getMessage = () => this.message;


    this.setTo = to => this.to = to;
    this.setFrom = from => this.from = from;
    this.setSubject = subject => this.subject = subject;
    this.setMessage = message => this.message = message;


    this.init = ()=> {
        this.server = email.server.connect({
            user: "churey.veer@gmail.com",
            password: "k@thm@ndu",
            host: "smtp.gmail.com",
            tls:true
        });


    }

    this.send = ()=> {
// send the message and get a callback with an error or details of the message that was sent
        var self = this;
        console.log("Sending email to " +  this.getTo());
        this.server.send({
            text: self.getMessage(),
            from: self.getFrom(),
            to: self.getTo(),
            // cc:      "else <else@your-email.com>",
            subject: self.getSubject()
        }, function (err, message) {
            console.log(err || message);
        });
    }
}


module.exports = Email;
//
// mail = new Email();
// mail.setTo("samundrak@yahoo.com");
// mail.setFrom("samundrak@yahoo.com");
// mail.setSubject("Hello Testing");
// mail.setMessage("A test message");
// mail.init();
// mail.send();