def calculate_trust(sources_count, user_score):
    base = 50
    base += sources_count * 10
    base += user_score * 0.2
    return min(base, 100)