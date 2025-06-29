using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.DTOs.Auth;
using backend.Exceptions;
using backend.Models;
using backend.Models.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AuthService(
            ApplicationDbContext context,
            IConfiguration configuration,
            IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _configuration = configuration;
            _passwordHasher = passwordHasher;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            // Check if email exists
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == registerDto.Email.ToLower()))
            {
                throw new BadRequestException("Email already registered");
            }

            // Validate role-specific fields
            ValidateRegistration(registerDto);

            // Create new user
            var user = new User
            {
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Role = registerDto.Role,
                Bio = registerDto.Bio,
                ProfileImageUrl = registerDto.ProfileImageUrl,
                Skills = registerDto.Skills,
                WillingToLearnSkills = registerDto.WillingToLearnSkills ?? new HashSet<TechSkill>(),
                JobTitle = registerDto.JobTitle ?? new HashSet<JobTitle>(),
                Password = string.Empty
            };

            // Hash password
            user.Password = _passwordHasher.HashPassword(user, registerDto.Password);

            // Save user
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate token and return response
            return new AuthResponseDto
            {
                Token = GenerateJwtToken(user),
                User = MapToUserDto(user)
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            // Find user
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());

            if (user == null)
            {
                throw new UnauthorizedException("The email or password you entered is incorrect");
            }

            // Verify password
            var result = _passwordHasher.VerifyHashedPassword(
                user, user.Password, loginDto.Password);

            if (result == PasswordVerificationResult.Failed)
            {
                throw new UnauthorizedException("The email or password you entered is incorrect");
            }

            // Return response
            return new AuthResponseDto
            {
                Token = GenerateJwtToken(user),
                User = MapToUserDto(user)
            };
        }

        public async Task<UserDto> GetUserByIdAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            return user == null ? throw new NotFoundException("User not found")
                               : MapToUserDto(user);
        }

        private void ValidateRegistration(RegisterDto registerDto)
        {
            if (registerDto.Role == UserRole.Student)
            {
                if (registerDto.WillingToLearnSkills == null || !registerDto.WillingToLearnSkills.Any())
                {
                    throw new BadRequestException("Students must specify skills they want to learn");
                }
            }
            else if (registerDto.Role == UserRole.Mentor)
            {
                if (registerDto.WillingToLearnSkills != null && registerDto.WillingToLearnSkills.Any())
                {
                    throw new BadRequestException("Mentors should not specify skills to learn");
                }
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
                ?? throw new InvalidOperationException("JWT_SECRET not found");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

            var token = new JwtSecurityToken(
                claims: new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                },
                expires: DateTime.Now.AddHours(24),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static UserDto MapToUserDto(User user) => new()
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
            Bio = user.Bio,
            ProfileImageUrl = user.ProfileImageUrl,
            Skills = user.Skills,
            WillingToLearnSkills = user.WillingToLearnSkills,
            JobTitle = user.JobTitle
        };
    }
}