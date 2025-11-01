import numpy as np
from scipy.optimize import curve_fit
import matplotlib.pyplot as plt

# Data (contoh)
I = np.array([26008.88, 26067.80, 26335.66, 25679.39, 25321.08, 25528.59, 26216.96, 25648.57, 25680.08, 25504.63])
A = np.array([0.002660236, 0.00192391, 0.00153866, 0.001435806, 0.00141469, 0.001493037, 0.001718281, 0.001980543, 0.002413302, 0.002025823])

# Model 1: Exponential
def model1(I, Amax, alpha, Rd):
    return Amax * (1 - np.exp(-alpha * I / Amax)) - Rd

# Model 2: Non-rectangular hyperbola
def model2(I, Amax, alpha, Rd):
    return (alpha * Amax * I) / (alpha * I + Amax) - Rd

# Tebakan awal berdasarkan data
Amax0 = max(A)
Rd0 = min(A)
alpha0 = (A[1] - A[0]) / (I[1] - I[0])

p0 = [Amax0, alpha0, Rd0]

# Batasan: semua parameter >= 0
bounds = (0, [np.inf, np.inf, np.inf])

# Fitting
popt1, _ = curve_fit(model1, I, A, p0=p0, bounds=bounds)
popt2, _ = curve_fit(model2, I, A, p0=p0, bounds=bounds)

print("Model 1:", popt1)
print("Model 2:", popt2)
