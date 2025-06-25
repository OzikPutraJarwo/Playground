if(!require(agricolae)) install.packages("agricolae")
if(!require(openxlsx)) install.packages("openxlsx")
library(agricolae)
library(openxlsx)

# Buat workbook baru
wb <- createWorkbook()

# Data frame untuk menyimpan critical range
all_critical <- data.frame()
# List untuk menyimpan hasil grouping
grouping_results <- list()

# Loop df_error dari 1 hingga 100
for(df_error in 2:2000) {
  
  # Atur nilai p
  p <- ifelse(df_error <= 24, df_error, 24)
  
  # Hitung r
  r <- (df_error + p) / p
  
  # Cek apakah r bilangan bulat
  if (r %% 1 != 0) next
  
  set.seed(123)
  perlakuan <- factor(rep(paste0("P", 1:p), each = r))
  mean_perlakuan <- seq(50, 70, length.out = p)
  nilai <- rnorm(p * r, mean = rep(mean_perlakuan, each = r), sd = 1)
  data <- data.frame(perlakuan, nilai)
  
  # Uji ANOVA
  model <- aov(nilai ~ perlakuan, data = data)
  
  # Duncan test
  uji_duncan <- duncan.test(model, "perlakuan", group = TRUE)
  
  # Simpan critical range
  critical_values <- uji_duncan$duncan$Table
  df_critical <- data.frame(
    df_error = df_error,
    p = p,
    r = r,
    step = seq_along(critical_values),
    critical_value = critical_values
  )
  all_critical <- rbind(all_critical, df_critical)
  
  # Simpan grouping letters
  grouping_df <- uji_duncan$groups
  grouping_df$perlakuan <- rownames(grouping_df)
  grouping_df$df_error <- df_error
  grouping_df$p <- p
  grouping_results[[length(grouping_results) + 1]] <- grouping_df
}

# Gabungkan semua hasil grouping
all_grouping <- do.call(rbind, grouping_results)

# Tambahkan sheet critical range
addWorksheet(wb, "Critical Range")
writeData(wb, "Critical Range", all_critical)

# Tambahkan sheet grouping letters
addWorksheet(wb, "Grouping Letters")
writeData(wb, "Grouping Letters", all_grouping)

# Simpan ke file Excel
dir.create("r/duncan", showWarnings = FALSE, recursive = TRUE)
saveWorkbook(wb, "r/duncan/hasil_duncan.xlsx", overwrite = TRUE)

cat("File Excel berhasil disimpan: r/duncan/hasil_duncan.xlsx\n")
