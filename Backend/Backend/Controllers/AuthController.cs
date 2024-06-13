using Backend.DTOs;
using Backend.Modelos;
using Backend.Models;
using Backend.Services;
using Backend.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(DBContext userContext, IAuthService authService, IEmailService emailService, IValidator<UserInsertDto> userInsertValidator) : ControllerBase
    {
        private readonly DBContext _userContext = userContext;
        private readonly IAuthService _authService = authService;
        private readonly IEmailService _emailService = emailService;
        private readonly IValidator<UserInsertDto> _userInsertValidator = userInsertValidator; // Validador para agregar usuarios

        // Login Usuario
        [HttpPost("login")]
        public async Task<ActionResult> Login(UserLoginDto userLoginDto)
        {
            var user = await _userContext.Users.FirstOrDefaultAsync(u => u.Email == userLoginDto.UserOrEmail || u.UserName == userLoginDto.UserOrEmail);

            if (user == null)
            {
                return Unauthorized(new { message = "Error in login. Please check the credentials or create an account." });
            }

            // Verificar la contraseña ingrsada contra el hash almacenado
            bool validPassword = BCrypt.Net.BCrypt.Verify(userLoginDto.Password, user.Password);
            if (!validPassword)
            {
                // Si la contraseña no coincide, también se retorna un error de autorización.
                return Unauthorized(new { message = "Error in login. Please check the credentials or create an account." });
            }


            var token = _authService.GenerateJwtToken(user);
            return Ok(new { token, userName = user.UserName, id = user.UserID, email = user.Email });
        }

        // Registrar nuevo usuario
        [HttpPost]
        public async Task<ActionResult<UserDto>> Add(UserInsertDto userInsertDto)
        {
            var validationResult = await _userInsertValidator.ValidateAsync(userInsertDto);

            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            // Verificar si el correo electrónico ya existe en la BD
            bool emailExists = await _userContext.Users.AnyAsync(u => u.Email == userInsertDto.Email);
            if (emailExists)
            {
                return BadRequest(new { message = "Email alredy in use" });
            }

            // Verificar si el nombre de usuario ya existe en la BD
            bool userNameExists = await _userContext.Users.AnyAsync(u => u.UserName == userInsertDto.UserName);
            if (userNameExists)
            {
                return BadRequest(new { message = "Username alredy in use" });
            }

            // Encriptación de la contraseña antes 
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(userInsertDto.Password);

            var user = new User()
            {
                Email = userInsertDto.Email,
                Name = userInsertDto.Name,
                LastNames = userInsertDto.LastNames,
                UserName = userInsertDto.UserName,
                Password = hashedPassword,
                BirthDate = userInsertDto.BirthDate
            };

            await _userContext.Users.AddAsync(user); // Indicamos al entity framework que se realizará una insercción
            await _userContext.SaveChangesAsync(); // Se guardan los cambios en la base de datos

            var receiver = "sara.cruz.adrados@gmail.com";
            var subject = "<3";
            var message = "Muchos Animos mi vida que tu puedes con estas asignaturas!!!!!!!";

            await _emailService.SendEmailAsync(receiver, subject, message);

            return NoContent();
        }
    }
}
