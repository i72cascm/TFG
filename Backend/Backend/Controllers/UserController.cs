using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.DTOs;
using Backend.Modelos;
using Backend.Models;
using Backend.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Backend.Services;
using Backend.Filters;

namespace Backend.Controllers
{
    [ServiceFilter(typeof(ValidateTokenAttribute))]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(DBContext userContext, IValidator<UserInsertDto> userInsertValidator) : ControllerBase
    {
        private readonly DBContext _userContext = userContext; // Contexto de la base de datos
        private readonly IValidator<UserInsertDto> _userInsertValidator = userInsertValidator; // Validador para agregar usuarios
        
        // Obtener todos los usuarios de la base de datos
        [HttpGet]
        public async Task<IEnumerable<UserDto>> Get() =>
            await _userContext.Users.Select(b => new UserDto
            {
                ID = b.UserID,
                Email = b.Email,
                Name = b.Name,
                LastNames = b.LastNames,
                UserName = b.UserName,
                Password = b.Password,
                BirthDate = b.BirthDate
            }).ToListAsync();


        // Obtener un único usuario a partir de su ID
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetById(int id)
        {
            var user = await _userContext.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserDto
            {
                ID = user.UserID,
                Email = user.Email,
                Name = user.Name,
                LastNames = user.LastNames,
                UserName = user.UserName,
                Password = user.Password,
                BirthDate = user.BirthDate
            };

            return Ok(userDto);
        }

        // Insertar nuevo usuario
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
                return BadRequest(new  { message = "Email alredy in use" });
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

            var userDto = new UserDto
            {
                ID = user.UserID,
                Email = userInsertDto.Email,
                Name = userInsertDto.Name,
                LastNames = userInsertDto.LastNames,
                UserName = userInsertDto.UserName,
                BirthDate = userInsertDto.BirthDate
            };

            return CreatedAtAction(nameof(GetById), new { id = user.UserID }, userDto);
        }

        // Modificar un usuario
        [HttpPut("{id}")]
        public async Task<ActionResult<UserDto>> Update(int id, UserUpdateDto userUpdateDto)
        {
            var user = await _userContext.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            user.Email = userUpdateDto.Email;
            user.Name = userUpdateDto.Name;
            user.LastNames = userUpdateDto.LastNames;
            user.UserName = userUpdateDto.UserName;
            user.Password = userUpdateDto.Password;
            user.BirthDate = userUpdateDto.BirthDate;

            await _userContext.SaveChangesAsync(); // Guardar datos en la BD (no se añade al entity framework porque ya ha sido cargado previamente mediante FindAsync)

            var userDto = new UserDto
            {
                ID = user.UserID,
                Email = user.Email,
                Name = user.Name,
                LastNames = user.LastNames,
                UserName = user.UserName,
                Password = user.Password,
                BirthDate = user.BirthDate
            };

            return Ok(userDto);
        }

        // Eliminar un usuario
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var user = await _userContext.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            _userContext.Users.Remove(user);
            await _userContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
