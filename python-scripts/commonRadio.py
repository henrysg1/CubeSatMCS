def calculate_checksum(buffer):
    CK_A = 0
    CK_B = 0
    for byte in buffer:
        CK_A = (CK_A + byte) % 255  # Ensure CK_A stays within 8-bit range
        CK_B = (CK_B + CK_A) % 255  # Ensure CK_B stays within 8-bit range
    return CK_A, CK_B

