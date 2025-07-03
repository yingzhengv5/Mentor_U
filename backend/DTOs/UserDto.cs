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
        public ICollection<SkillDto> Skills { get; set; } = new List<SkillDto>();
        public ICollection<SkillDto>? WillingToLearnSkills { get; set; } = new List<SkillDto>();
        public JobTitleDto? CurrentJobTitle { get; set; }
    }

    public class SkillDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class JobTitleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}