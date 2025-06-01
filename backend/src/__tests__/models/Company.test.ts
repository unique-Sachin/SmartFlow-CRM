import { Company } from '../../models/Company';
import { Types } from 'mongoose';

describe('Company Model Test', () => {
  const validCompanyData = {
    name: 'Test Company',
    industry: 'Technology',
    size: 'medium',
    status: 'active',
    website: 'https://testcompany.com',
    description: 'A test company',
    addresses: [{
      type: 'headquarters',
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      country: 'Test Country',
      isPrimary: true
    }],
    metadata: {
      createdBy: new Types.ObjectId(),
      lastModifiedBy: new Types.ObjectId()
    }
  };

  it('should create & save company successfully', async () => {
    const validCompany = new Company(validCompanyData);
    const savedCompany = await validCompany.save();
    
    expect(savedCompany._id).toBeDefined();
    expect(savedCompany.name).toBe(validCompanyData.name);
    expect(savedCompany.industry).toBe(validCompanyData.industry);
    expect(savedCompany.size).toBe(validCompanyData.size);
    expect(savedCompany.status).toBe(validCompanyData.status);
  });

  it('should fail to save with invalid size', async () => {
    const companyWithInvalidSize = new Company({
      ...validCompanyData,
      size: 'invalid_size'
    });

    await expect(companyWithInvalidSize.save()).rejects.toThrow();
  });

  it('should fail to save with invalid status', async () => {
    const companyWithInvalidStatus = new Company({
      ...validCompanyData,
      status: 'invalid_status'
    });

    await expect(companyWithInvalidStatus.save()).rejects.toThrow();
  });

  it('should fail to save without required fields', async () => {
    const companyWithoutRequired = new Company({
      name: 'Test Company'
    });

    await expect(companyWithoutRequired.save()).rejects.toThrow();
  });

  it('should save company with valid address', async () => {
    const validAddress = {
      type: 'billing',
      street: '456 Test St',
      city: 'Another City',
      state: 'Another State',
      postalCode: '67890',
      country: 'Another Country',
      isPrimary: false
    };

    const company = new Company(validCompanyData);
    company.addresses.push(validAddress);
    const savedCompany = await company.save();

    expect(savedCompany.addresses).toHaveLength(2);
    expect(savedCompany.addresses[1].type).toBe(validAddress.type);
  });

  it('should fail to save with invalid address type', async () => {
    const invalidAddress = {
      type: 'invalid_type',
      street: '456 Test St',
      city: 'Another City',
      state: 'Another State',
      postalCode: '67890',
      country: 'Another Country',
      isPrimary: false
    };

    const company = new Company(validCompanyData);
    company.addresses.push(invalidAddress);

    await expect(company.save()).rejects.toThrow();
  });
}); 