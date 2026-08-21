def parse_csv_metrics(filepath):
    total = 0.0
    count = 0
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for line in lines[1:]:  # skip header
            parts = line.strip().split(',')
            if len(parts) >= 2:
                try:
                    val = float(parts[1])
                    total += val
                    count += 1
                except ValueError:
                    pass
    return {
        "rows": count,
        "total": total,
        "average": (total / count) if count > 0 else 0.0
    }
