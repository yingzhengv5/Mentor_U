using System.ComponentModel.DataAnnotations;
using backend.Models.Enums;

namespace backend.DTOs.Auth
{
    public class RegisterDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required UserRole Role { get; set; }
        public string? Bio { get; set; }
        public string? ProfileImageUrl { get; set; }

        // Skills and job preferences
        public List<Guid> SkillIds { get; set; } = new();
        public List<Guid>? WillingToLearnSkillIds { get; set; } // Only for Students
        public Guid? JobTitleId { get; set; } // Current role for Mentors, Looking for role for Students
    }
}
