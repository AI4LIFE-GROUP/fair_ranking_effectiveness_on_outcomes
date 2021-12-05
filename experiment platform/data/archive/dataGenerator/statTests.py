# Example of the Student's t-test
from scipy.stats import ttest_ind
data1 = [2.0, 4.67, 4.33, 3.0, 3.33, 3.0, 7.0, 2.0, 5.67, 4.33, 2.0, 2.0, 2.0, 4.67, 4.33, 3.0, 3.33, 3.0, 6.0, 2.0]
data2 = [4.0, 3.33, 4.67, 5.00, 4.67, 6.00, 4.33, 4.67, 3.00, 3.67, 9.0, 3.00, 2.00, 3.00, 5.67, 6.00, 4.33, 6.00, 4.33, 6.00]
print(len(data1))
stat, p = ttest_ind(data1, data2)
print('stat=%.3f, p=%.3f' % (stat, p))
if p > 0.05:
	print('Probably the same distribution')
else:
	print('Probably different distributions')

