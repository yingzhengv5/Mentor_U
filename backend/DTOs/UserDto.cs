using backend.Models.Enums;

namespace backend.DTOs
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public required string Email { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public UserRole Role { get; set; }
        public string? Bio { get; set; }
        public string? ProfileImageUrl { get; set; }
        public HashSet<TechSkill> Skills { get; set; } = new();
        public HashSet<TechSkill>? WillingToLearnSkills { get; set; } = new();
        public HashSet<JobTitle> JobTitle { get; set; } = new();
    }
}