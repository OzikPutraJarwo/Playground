if(!require(agricolae)) install.packages("agricolae")
library(agricolae)

for(df_error in 2:24) {
  p <- 24
  r <- (df_error + p) / p
  if (r %% 1 != 0) next
  set.seed(123)
  perlakuan <- factor(rep(paste0("P", 1:p), each = r))
  mean_perlakuan <- seq(50, 70, length.out = p)
  nilai <- rnorm(p * r, mean = rep(mean_perlakuan, each = r), sd = 1)
  data <- data.frame(perlakuan, nilai)
  model <- aov(nilai ~ perlakuan, data = data)
  uji_duncan <- duncan.test(model, "perlakuan", group = TRUE)
  print(uji_duncan$duncan$Table)
}