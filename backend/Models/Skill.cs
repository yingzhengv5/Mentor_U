using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Skill
    {
        public Skill()
        {
            UserSkills = new List<UserSkill>();
            UserWillingToLearnSkills = new List<UserWillingToLearnSkill>();
        }

        [Key]
        public Guid Id { get; set; }

        [Required]
        public required string name { get; set; }

        // Navigation properties
        public virtual ICollection<UserSkill> UserSkills { get; set; }
        public virtual ICollection<UserWillingToLearnSkill> UserWillingToLearnSkills { get; set; }
    }
}