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

            // Validate role-specific fields and required data
            await ValidateRegistrationAsync(registerDto);

            // Start a transaction to ensure all related data is saved
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Create new user
                var user = new User
                {
                    Email = registerDto.Email,
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    Role = registerDto.Role,
                    Bio = registerDto.Bio,
                    ProfileImageUrl = registerDto.ProfileImageUrl,
                    Password = string.Empty
                };

                // Hash password
                user.Password = _passwordHasher.HashPassword(user, registerDto.Password);

                // Save user first to get the Id
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Add skills (required for both roles)
                foreach (var skillId in registerDto.SkillIds)
                {
                    var skill = await _context.Skills.FindAsync(skillId);
                    if (skill == null)
                    {
                        throw new BadRequestException($"Skill with ID {skillId} not found");
                    }

                    _context.UserSkills.Add(new UserSkill
                    {
                        UserId = user.Id,
                        SkillId = skillId,
                        User = user,
                        Skill = skill
                    });
                }

                // Add willing to learn skills for students (required for students)
                if (registerDto.Role == UserRole.Student)
                {
                    foreach (var skillId in registerDto.WillingToLearnSkillIds!)
                    {
                        var skill = await _context.Skills.FindAsync(skillId);
                        if (skill == null)
                        {
                            throw new BadRequestException($"Skill with ID {skillId} not found");
                        }

                        _context.UserWillingToLearnSkills.Add(new UserWillingToLearnSkill
                        {
                            UserId = user.Id,
                            SkillId = skillId,
                            User = user,
                            Skill = skill
                        });
                    }
                }

                // Add job title (required for both roles)
                var jobTitle = await _context.JobTitles.FindAsync(registerDto.JobTitleId);
                if (jobTitle == null)
                {
                    throw new BadRequestException($"Job title with ID {registerDto.JobTitleId} not found");
                }

                _context.UserJobTitles.Add(new UserJobTitle
                {
                    UserId = user.Id,
                    JobTitleId = jobTitle.Id,
                    User = user,
                    JobTitle = jobTitle
                });

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Generate token and return response
                return new AuthResponseDto
                {
                    Token = GenerateJwtToken(user),
                    User = await MapToUserDtoAsync(user)
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task ValidateRegistrationAsync(RegisterDto registerDto)
        {
            // Validate required skills for all users
            if (registerDto.SkillIds == null || !registerDto.SkillIds.Any())
            {
                throw new BadRequestException("Skills are required for registration");
            }

            // Validate job title for all users
            if (!registerDto.JobTitleId.HasValue)
            {
                throw new BadRequestException(registerDto.Role == UserRole.Mentor ?
                    "Current job title is required for mentors" :
                    "Desired job title is required for students");
            }

            if (registerDto.Role == UserRole.Student)
            {
                // Validate willing to learn skills for students
                if (registerDto.WillingToLearnSkillIds == null || !registerDto.WillingToLearnSkillIds.Any())
                {
                    throw new BadRequestException("Students must specify skills they want to learn");
                }
            }
            else if (registerDto.Role == UserRole.Mentor)
            {
                // Ensure mentors don't specify willing to learn skills
                if (registerDto.WillingToLearnSkillIds != null && registerDto.WillingToLearnSkillIds.Any())
                {
                    throw new BadRequestException("Mentors should not specify skills to learn");
                }
            }

            // Validate that all skills exist
            if (registerDto.SkillIds.Any())
            {
                var existingSkillIds = await _context.Skills
                    .Where(s => registerDto.SkillIds.Contains(s.Id))
                    .Select(s => s.Id)
                    .ToListAsync();

                var invalidSkillIds = registerDto.SkillIds.Except(existingSkillIds).ToList();
                if (invalidSkillIds.Any())
                {
                    throw new BadRequestException($"Invalid skill IDs: {string.Join(", ", invalidSkillIds)}");
                }
            }

            // Validate that all willing to learn skills exist
            if (registerDto.WillingToLearnSkillIds != null && registerDto.WillingToLearnSkillIds.Any())
            {
                var existingSkillIds = await _context.Skills
                    .Where(s => registerDto.WillingToLearnSkillIds.Contains(s.Id))
                    .Select(s => s.Id)
                    .ToListAsync();

                var invalidSkillIds = registerDto.WillingToLearnSkillIds.Except(existingSkillIds).ToList();
                if (invalidSkillIds.Any())
                {
                    throw new BadRequestException($"Invalid willing to learn skill IDs: {string.Join(", ", invalidSkillIds)}");
                }
            }

            // Validate job title exists
            var jobTitleExists = await _context.JobTitles.AnyAsync(j => j.Id == registerDto.JobTitleId);
            if (!jobTitleExists)
            {
                throw new BadRequestException($"Invalid job title ID: {registerDto.JobTitleId}");
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            // Find user with related data
            var user = await _context.Users
                .Include(u => u.Skills)
                    .ThenInclude(us => us.Skill)
                .Include(u => u.WillingToLearnSkills)
                    .ThenInclude(us => us.Skill)
                .Include(u => u.JobTitles)
                    .ThenInclude(uj => uj.JobTitle)
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
                User = await MapToUserDtoAsync(user)
            };
        }

        public async Task<UserDto> GetUserByIdAsync(Guid id)
        {
            var user = await _context.Users
                .Include(u => u.Skills)
                    .ThenInclude(us => us.Skill)
                .Include(u => u.WillingToLearnSkills)
                    .ThenInclude(us => us.Skill)
                .Include(u => u.JobTitles)
                    .ThenInclude(uj => uj.JobTitle)
                .FirstOrDefaultAsync(u => u.Id == id);

            return user == null ? throw new NotFoundException("User not found")
                               : await MapToUserDtoAsync(user);
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

        private async Task<UserDto> MapToUserDtoAsync(User user)
        {
            // Ensure the collections are loaded
            await _context.Entry(user)
                .Collection(u => u.Skills)
                .Query()
                .Include(us => us.Skill)
                .LoadAsync();

            await _context.Entry(user)
                .Collection(u => u.WillingToLearnSkills)
                .Query()
                .Include(us => us.Skill)
                .LoadAsync();

            await _context.Entry(user)
                .Collection(u => u.JobTitles)
                .Query()
                .Include(uj => uj.JobTitle)
                .LoadAsync();

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                Bio = user.Bio,
                ProfileImageUrl = user.ProfileImageUrl,
                Skills = user.Skills.Select(us => new SkillDto
                {
                    Id = us.Skill.Id,
                    Name = us.Skill.name
                }).ToList(),
                WillingToLearnSkills = user.WillingToLearnSkills.Select(us => new SkillDto
                {
                    Id = us.Skill.Id,
                    Name = us.Skill.name
                }).ToList(),
                CurrentJobTitle = user.JobTitles.Select(uj => new JobTitleDto
                {
                    Id = uj.JobTitle.Id,
                    Name = uj.JobTitle.name
                }).FirstOrDefault()
            };
        }
    }
}