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

            // Usuario existe
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

            // La cuenta esta validada a través de correo
            if (!user.Validate)
            {
                return Unauthorized(new { message = "Error in login. Please validate the account first." });
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
                BirthDate = userInsertDto.BirthDate,
                Role = "User",
                Validate = false,
                ValidateToken = Guid.NewGuid().ToString()
            };

            await _userContext.Users.AddAsync(user); // Indicamos al entity framework que se realizará una insercción
            await _userContext.SaveChangesAsync(); // Se guardan los cambios en la base de datos

            var receiver = user.Email;

            await _emailService.SendEmailValidateAccount(receiver, user.ValidateToken);

            return NoContent();
        }

        // Validar email
        [HttpGet("validate-email")]
        public async Task<ActionResult> ValidateEmail(string token, string email)
        {
            var user = await _userContext.Users
                          .FirstOrDefaultAsync(u => u.Email == email && u.ValidateToken == token);

            if (user == null)
            {
                return BadRequest(new { message = "Invalid Token" });
            }

            user.Validate = true; // Marcar el email como verificado
            user.ValidateToken = "-"; // Limpiar el token

            await _userContext.SaveChangesAsync();

            return Ok(new { message = "Email verified successfully!" });
        }

        // Resquest para el cambio de contraseña (NO modifica la contraseña, se encarga de enviar el email y generar el token de cambio de contraseña)
        [HttpGet("reset-password")]
        public async Task<ActionResult> ResetPassword(string email) 
        {
            // Buscar al usuario del correo
            var user = await _userContext.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return NotFound(new { message = "User with the given email does not exist." });
            }

            // Generar token para resetear password
            var resetToken = Guid.NewGuid().ToString();
            user.ResetPasswordToken = resetToken;

            // Guardar token en BD
            await _userContext.SaveChangesAsync();

            await _emailService.SendEmailResetPassword(email, user.ResetPasswordToken);

            return Ok(new { message = "Reset password link has been sent to your email." });
        }

        [HttpPut("update-password")]
        public async Task<ActionResult> UpdatePassword(string email, string token, string newPassword)
        {
            // Comprobar que todos lo parámetros han llegado correctamente
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token) || string.IsNullOrEmpty(newPassword))
            {
                return BadRequest(new { message = "Missing data. Please ensure all fields are provided." });
            }

            // Buscar usuario a través de email en la BD
            var user = await _userContext.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return NotFound(new { message = "User with the given email does not exist." });
            }

            // Verificar si el token es válido
            if (user.ResetPasswordToken != token || string.IsNullOrWhiteSpace(user.ResetPasswordToken))
            {
                return BadRequest(new { message = "Invalid or expired password reset token." });
            }

            // Actualizar la contraseña del usuario
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.Password = hashedPassword; // Encriptar contraseña y actualizar
            user.ResetPasswordToken = "-"; // Limpiar el token

            // Guardar los cambios en la base de datos
            await _userContext.SaveChangesAsync();

            return Ok(new { message = "Password has been successfully updated." });
        }
    }
}
