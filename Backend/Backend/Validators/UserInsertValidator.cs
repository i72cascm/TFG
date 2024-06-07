using System.Text.RegularExpressions;
using Backend.DTOs;
using FluentValidation;

namespace Backend.Validators
{
    public class UserInsertValidator : AbstractValidator<UserInsertDto>
    {
        public UserInsertValidator() 
        {
            // Comprobante Email
            RuleFor(user => user.Email).NotEmpty().WithMessage("It is mandatory to enter an email address.");
            RuleFor(user => user.Email)
                .Must(IsValidEmail)
                .WithMessage("Enter a valid email format.");

            // Comprobante Name
            RuleFor(user => user.Name).NotEmpty().WithMessage("It is mandatory to enter a Name.");

            // Comprobante LastNames
            RuleFor(user => user.LastNames).NotEmpty().WithMessage("It is mandatory to enter LastNames.");

            // Comprobante Password
            RuleFor(user => user.Password).NotEmpty().WithMessage("It is mandatory to enter a Password.");
            RuleFor(user => user.Password)
                .Must(IsValidPassword)
                .WithMessage("Password format is incorrect. Your password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.");

            //Comprobante UserName
            RuleFor(user => user.UserName)
                .NotEmpty().WithMessage("It is mandatory to enter a Username.")
                .Length(3, 20).WithMessage("Username must be between 3 and 20 characters.")
                .Matches(@"^[a-zA-Z0-9]+[a-zA-Z0-9_]*[a-zA-Z0-9]+$").WithMessage("Username must start and end with a letter or number and may contain underscores.")
                .Matches(@"^(?!.*__)[a-zA-Z0-9_]+$").WithMessage("Username must not contain consecutive underscores.");

            // Comprobante BirthDate (custom)
            RuleFor(user => user.BirthDate)
                .Custom((user, error) =>
                {
                    var today = DateOnly.FromDateTime(DateTime.Today);
                    int userAge = today.Year - user.Year;

                    if(user.AddYears(userAge) > today)
        {
                        userAge--;
                    }

                    if (user.Year <= 1900)
                    {
                        error.AddFailure("The age is too old.");
                    }else if (userAge < 18){
                        error.AddFailure("Youy must be over 18 years old.");
                    }
                });
        }

        // Función de validación para estructura de un email correcta
        private bool IsValidEmail(string email)
        {
            string pattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
            return Regex.IsMatch(email, pattern);
        }

        // Función de validación de password:
        // - Al menos 8 caracteres de longitud
        // - Al menos 1 letra mayúscula
        // - Al menos 1 letra minúscula
        // - Al menos un dígito
        // - Al menos un carácter especial 
        private bool IsValidPassword(string password)
        {
            string pattern = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$"; 
            return Regex.IsMatch(password, pattern);
        }
    }
}