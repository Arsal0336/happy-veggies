using System.Collections.ObjectModel;

namespace HappyVeggie.Domain.Entities;

public enum ProductionAreaTypeCategory
{
    Open = 0,
    Protected = 1,
    Experimental = 2
}

public sealed class ProductionAreaType
{
    // Stable machine identifier (used by the API/DTOs).
    public string Code { get; set; } = string.Empty;

    public string NameEn { get; set; } = string.Empty;

    public string NameUr { get; set; } = string.Empty;

    public ProductionAreaTypeCategory Category { get; set; }

    public bool Enabled { get; set; } = true;

    public ICollection<ProductionArea> ProductionAreas { get; set; } = new List<ProductionArea>();
}
