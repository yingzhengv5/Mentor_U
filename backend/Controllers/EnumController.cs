using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Collections.Generic;
using backend.DTOs;
using backend.Models.Enums;
using backend.Utilities;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnumController : ControllerBase
    {
        [HttpGet("job-titles")]
        public ActionResult<IEnumerable<EnumValueDto>> GetJobTitles()
        {
            var jobTitles = Enum.GetValues<JobTitle>()
                .Select(title => new EnumValueDto
                {
                    Value = title.ToString(),
                    DisplayName = title.ToDisplayName()
                })
                .OrderBy(dto => dto.DisplayName)
                .ToList();

            return Ok(jobTitles);
        }

        [HttpGet("tech-skills")]
        public ActionResult<IEnumerable<EnumValueDto>> GetTechSkills()
        {
            var skills = Enum.GetValues<TechSkill>()
                .Select(skill => new EnumValueDto
                {
                    Value = skill.ToString(),
                    DisplayName = skill.ToDisplayName()
                })
                .OrderBy(dto => dto.DisplayName)
                .ToList();

            return Ok(skills);
        }
    }
}