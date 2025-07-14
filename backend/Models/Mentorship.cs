using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;

namespace backend.Models
{
    public class Mentorship
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid MentorId { get; set; }

        public Guid? StudentId { get; set; }

        [Required]
        public MentorshipDuration Duration { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        [Required]
        public MentorshipStatus Status { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        [ForeignKey("MentorId")]
        public virtual required User Mentor { get; set; }

        [ForeignKey("StudentId")]
        public virtual User? Student { get; set; }
    }
}