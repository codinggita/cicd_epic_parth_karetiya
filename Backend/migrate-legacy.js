require('dotenv').config();
const localUri = process.env.MONGO_LOCAL_URI || 'mongodb://localhost:27017';
const localDbName = 'cicd';

const atlasUri = process.env.MONGO_ATLAS_URI;
const atlasDbName = 'cicd';

async function migrate() {
  let localClient, atlasClient;
  try {
    console.log('🔌 Connecting to local MongoDB...');
    localClient = await MongoClient.connect(localUri);
    const localDb = localClient.db(localDbName);
    const localCollection = localDb.collection('data');

    console.log('📥 Fetching legacy data from local database...');
    const documents = await localCollection.find({}).toArray();
    console.log(`✅ Retrieved ${documents.length} legacy documents.`);

    if (documents.length === 0) {
      console.log('⚠️ No documents found to migrate. Make sure your local MongoDB has the "cicd" database and "data" collection!');
      process.exit(0);
    }

    console.log('🔌 Connecting to MongoDB Atlas...');
    atlasClient = await MongoClient.connect(atlasUri);
    const atlasDb = atlasClient.db(atlasDbName);
    const atlasCollection = atlasDb.collection('data');

    console.log('🗑️ Dropping existing data collection on Atlas (if any)...');
    try {
      await atlasCollection.drop();
      console.log('✅ Dropped existing collection.');
    } catch (e) {
      console.log('ℹ️ No existing collection to drop.');
    }

    console.log('📤 Inserting legacy documents into Atlas...');
    // Insert in batches to prevent hitting driver payload limits
    const batchSize = 500;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      await atlasCollection.insertMany(batch);
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`);
    }

    console.log('🎯 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (localClient) localClient.close();
    if (atlasClient) atlasClient.close();
  }
}

migrate();
