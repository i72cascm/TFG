using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;
using Backend.Constants;

namespace Backend.Services
{
    public class EmailService : IEmailService
    {
        public Task SendEmailValidateAccount(string email, string token)
        {
            var subject = "Account Confirmation Email";
            var callbackUrl = $"{Dominio.frontUrl}/account-validation?token={token}&email={email}";
            var message = $@"
            <html>
                <head>
                    <style>
                        body {{ font-family: 'Arial'; }}
                        .button {{
                            display: inline-block;
                            padding: 10px 20px;
                            font-size: 16px;
                            cursor: pointer;
                            text-align: center;
                            text-decoration: none;
                            outline: none;
                            color: #000; /* Texto negro */
                            background-color: #4CAF50;
                            border: none;
                            border-radius: 15px;
                            box-shadow: 0 9px #999;
                            font-weight: bold; /* Fuente más gruesa */
                        }}
                        .button:hover {{ background-color: #3e8e41 }}
                        .button:active {{
                            background-color: #3e8e41;
                            box-shadow: 0 5px #666;
                            transform: translateY(4px);
                        }}
                    </style>
                </head>
                <body>
                    <h1>Welcome!</h1>
                    <h3>Thank you for signing in. Please confirm your email to activate your account.</h3>
                    <a href='{callbackUrl}' class='button'>Validate Email</a>
                </body>
            </html>";

            var sender = "recipeapptfgi72cascm@gmail.com";
            var pw = "twbd kfcf nhao cffd";

            var client = new SmtpClient("smtp.gmail.com", 587)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(sender, pw),
                UseDefaultCredentials = false
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(sender),
                Subject = subject,
                Body = message,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(new MailAddress(email));

            return client.SendMailAsync(mailMessage);
        }

        public Task SendEmailResetPassword(string email, string token)
        {
            var subject = "Reset Your Password";
            var callbackUrl = $"{Dominio.frontUrl}/new-password?token={token}&email={email}";
            var message = $@"
            <html>
                <head>
                    <style>
                        body {{ font-family: 'Arial'; }}
                        .button {{
                            display: inline-block;
                            padding: 10px 20px;
                            font-size: 16px;
                            cursor: pointer;
                            text-align: center;
                            text-decoration: none;
                            outline: none;
                            color: #000; /* Texto negro */
                            background-color: #4CAF50;
                            border: none;
                            border-radius: 15px;
                            box-shadow: 0 9px #999;
                            font-weight: bold; /* Fuente más gruesa */
                        }}
                        .button:hover {{ background-color: #3e8e41 }}
                        .button:active {{
                            background-color: #3e8e41;
                            box-shadow: 0 5px #666;
                            transform: translateY(4px);
                        }}
                    </style>
                </head>
                <body>
                    <h1>Reset Your Password</h1>
                    <h3>Please use the button below to reset your password.</h3>
                    <a href='{callbackUrl}' class='button'>Reset Password</a>
                </body>
            </html>";

            var sender = "recipeapptfgi72cascm@gmail.com";
            var pw = "twbd kfcf nhao cffd";

            var client = new SmtpClient("smtp.gmail.com", 587)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(sender, pw),
                UseDefaultCredentials = false
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(sender),
                Subject = subject,
                Body = message,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(new MailAddress(email));

            return client.SendMailAsync(mailMessage);
        }
    }
}
