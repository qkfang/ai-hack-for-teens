using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class AppSetting
{
    [Key]
    [MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;
}
