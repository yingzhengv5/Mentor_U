using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;

namespace backend.Models
{
    public class Friendship
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid RequesterId { get; set; }

        [Required]
        public Guid ReceiverId { get; set; }

        [Required]
        public RequestStatus Status { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public DateTime? AcceptedAt { get; set; }

        // Navigation properties
        [ForeignKey("RequesterId")]
        public virtual required User Requester { get; set; }

        [ForeignKey("ReceiverId")]
        public virtual required User Receiver { get; set; }
    }
}