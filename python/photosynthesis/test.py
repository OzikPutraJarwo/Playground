# Executing the provided fit code and showing results + plot
import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit

# Given data (Y, e, X)
data = np.array([
[-4.75113,0],	[2.437707,200],	[6.477386,400],	[8.644006,600],	[9.939014,800],	[10.84425,1000],	[11.78001,1200],	[12.46151,1400],	[12.94231,1600],
[-3.57722,0],	[2.269165,200],	[4.249663,400],	[5.300662,600],	[5.764949,800],	[7.039987,1000],	[7.954612,1200],	[8.946292,1400],	[9.991456,1600],
[-4.26089,0],	[3.264546,200],	[7.183266,400],	[9.906985,600],	[11.20205,800],	[12.32419,1000],	[13.26357,1200],	[13.48617,1400],	[14.07556,1600],
[-4.08198,0],	[3.090875,200],	[7.026732,400],	[9.116899,600],	[10.99615,800],	[11.75715,1000],	[13.37213,1200],	[13.75519,1400],	[14.20872,1600],
[-4.301309,0],	[2.037596,200],	[5.116385,400],	[6.754144,600],	[7.913526,800],	[8.440102,1000],	[9.016014,1200],	[10.0863,1400],	[10.65418,1600],

])

Y = data[:, 0]
# e_col = data[:, 1]
X = data[:, 1]

# --- Fitting the exponential model (unchanged) ---
def model(x, y0, a, c):
    return y0 + a * (1 - np.exp(-c * x))

y0_guess = Y[0]
a_guess = Y.max() - y0_guess
c_guess = 0.001
p0 = [y0_guess, a_guess, c_guess]

popt, pcov = curve_fit(model, X, Y, p0=p0, bounds=([-50, 0, 0],[50, 50, 1]), maxfev=20000)
y0_fit, a_fit, c_fit = popt
asymptote = y0_fit + a_fit

# --- Fitting a linear model to the initial data points (NEW) ---
# We'll use the first 3 data points for the initial linear slope
X_linear = X[:3]
Y_linear = Y[:3]

def linear_model(x, m, b):
    return m * x + b

# Initial guesses for linear fit
p0_linear = [0.05, -4]
popt_linear, _ = curve_fit(linear_model, X_linear, Y_linear, p0=p0_linear)
m_fit, b_fit = popt_linear

# --- Calculating the intersection point (NEW) ---
# Intersection happens when linear_model(x) = asymptote
# m*x + b = asymptote  =>  x = (asymptote - b) / m
x_intersect = (asymptote - b_fit) / m_fit
y_intersect = asymptote

# --- Plotting all the data and lines (MODIFIED) ---
x_plot = np.linspace(0, 1600, 300)
y_plot = model(x_plot, *popt)

plt.figure(figsize=(8,5))
# Perubahan ini menambahkan error bar
# plt.errorbar(X, Y, yerr=e_col, fmt='o', color='black', capsize=5, label='Data with Error Bars')
plt.errorbar(X, Y, fmt='o', color='black', capsize=5, label='Data with Error Bars')
plt.plot(x_plot, y_plot, color='black', label='Exponential Fit')

# Plot the linear line (blue line in the image)
x_linear_plot = np.linspace(0, x_intersect, 100)
y_linear_plot = linear_model(x_linear_plot, m_fit, b_fit)
plt.plot(x_linear_plot, y_linear_plot, color='blue', linestyle='-', label='Initial Linear Slope')

# Plot the horizontal asymptote (red line in the image)
x_asymptote_plot = np.linspace(x_intersect, 1800, 100)
y_asymptote_plot = np.full_like(x_asymptote_plot, asymptote)
plt.plot(x_asymptote_plot, y_asymptote_plot, color='red', linestyle='-', label='Saturated Asymptote')

custom_x_values = [608.93]

print("\n--- Custom Linear Model Calculations ---")
for x_val in custom_x_values:
    y_calc = linear_model(x_val, m_fit, b_fit)
    print(f"{x_val:.3f}, {y_calc:.6f}")

# # Add a circle at the intersection point
# plt.plot(x_intersect, y_intersect, 'o', color='red')
# plt.text(x_intersect + 20, y_intersect, f'({x_intersect:.2f}, {y_intersect:.2f})', fontsize=9, color='red')

# plt.xlabel('Qin (µmol m⁻² s⁻¹)')
# plt.ylabel('Photosynthesis rate (µmol m⁻² s⁻¹)')
# # plt.legend()
# plt.grid(True)
# # plt.title('Exponential Saturation Model with Linear Approximation')
# plt.show()

