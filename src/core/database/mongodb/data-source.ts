import { environment } from 'src/environments/environment';
import { DataSource, DataSourceOptions } from 'typeorm';

export const datasourceOptions: DataSourceOptions = {
  name: 'mongodb',
  type: 'mongodb',
  url: environment.MONGODB_URI,
  entities: ['dist/**/*.entity.js'],
  synchronize: true,
  logging: true,
};

export default new DataSource(datasourceOptions);
