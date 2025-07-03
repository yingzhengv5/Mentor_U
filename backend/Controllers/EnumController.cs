using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnumController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EnumController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("job-titles")]
        public async Task<ActionResult<IEnumerable<JobTitleDto>>> GetJobTitles()
        {
            var jobTitles = await _context.JobTitles
                .Select(title => new JobTitleDto
                {
                    Id = title.Id,
                    Name = title.name
                })
                .OrderBy(dto => dto.Name)
                .ToListAsync();

            return Ok(jobTitles);
        }

        [HttpGet("tech-skills")]
        public async Task<ActionResult<IEnumerable<SkillDto>>> GetTechSkills()
        {
            var skills = await _context.Skills
                .Select(skill => new SkillDto
                {
                    Id = skill.Id,
                    Name = skill.name
                })
                .OrderBy(dto => dto.Name)
                .ToListAsync();

            return Ok(skills);
        }
    }
}