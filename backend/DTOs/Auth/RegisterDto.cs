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
        public HashSet<TechSkill> Skills { get; set; } = new();
        public HashSet<TechSkill>? WillingToLearnSkills { get; set; } // Only for Students
        public HashSet<JobTitle> JobTitle { get; set; } = new();
    }
}
