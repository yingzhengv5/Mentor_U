using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
    [Index(nameof(MentorId), nameof(StudentId), IsUnique = true)]
    public class Mentorship
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid MentorId { get; set; }

        [Required]
        public Guid StudentId { get; set; }

        [Required]
        public MentorshipDuration Duration { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        [Required]
        public MentorshipStatus Status { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        [MaxLength(500)]
        public string? Message { get; set; }

        // Navigation properties
        [ForeignKey("MentorId")]
        public virtual required User Mentor { get; set; }

        [ForeignKey("StudentId")]
        public virtual required User Student { get; set; }
    }
}