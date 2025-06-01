import { Request, Response } from 'express';
import { CompanyController } from '../../controllers/companyController';
import { Company, ICompany } from '../../models/Company';
import { Types } from 'mongoose';

describe('CompanyController', () => {
  const mockUserId = new Types.ObjectId();
  const mockUser = {
    id: mockUserId.toString(),
    role: 'admin',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  };

  const mockCompanyData = {
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
      createdBy: mockUserId,
      lastModifiedBy: mockUserId
    }
  };

  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: Record<string, any> = {};

  beforeEach(() => {
    responseObject = {};
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: mockUser
    };
    mockResponse = {
      json: jest.fn().mockImplementation(result => {
        responseObject = result;
        return mockResponse;
      }),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('create', () => {
    it('should create a new company', async () => {
      mockRequest.body = mockCompanyData;
      
      await CompanyController.create(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toHaveProperty('name', mockCompanyData.name);
    });
  });

  describe('getAll', () => {
    beforeEach(async () => {
      await Company.create(mockCompanyData);
    });

    it('should get all companies with pagination', async () => {
      mockRequest.query = { page: '1', limit: '10' };
      
      await CompanyController.getAll(mockRequest as Request, mockResponse as Response);
      
      expect(responseObject).toHaveProperty('companies');
      expect(responseObject).toHaveProperty('total');
      expect(responseObject).toHaveProperty('page');
      expect(responseObject).toHaveProperty('totalPages');
    });

    it('should filter companies by status', async () => {
      mockRequest.query = { status: 'active' };
      
      await CompanyController.getAll(mockRequest as Request, mockResponse as Response);
      
      const { companies } = responseObject as { companies: ICompany[] };
      expect(companies.every((c: ICompany) => c.status === 'active')).toBe(true);
    });
  });

  describe('getById', () => {
    let savedCompany: ICompany;

    beforeEach(async () => {
      savedCompany = await Company.create(mockCompanyData);
    });

    it('should get company by id', async () => {
      mockRequest.params = { id: savedCompany._id.toString() };
      
      await CompanyController.getById(mockRequest as Request, mockResponse as Response);
      
      expect(responseObject).toHaveProperty('_id', savedCompany._id.toString());
      expect(responseObject).toHaveProperty('name', mockCompanyData.name);
    });

    it('should return 404 for non-existent company', async () => {
      mockRequest.params = { id: new Types.ObjectId().toString() };
      
      await CompanyController.getById(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('update', () => {
    let savedCompany: ICompany;

    beforeEach(async () => {
      savedCompany = await Company.create(mockCompanyData);
    });

    it('should update company', async () => {
      const updateData = { name: 'Updated Company Name' };
      mockRequest.params = { id: savedCompany._id.toString() };
      mockRequest.body = updateData;
      
      await CompanyController.update(mockRequest as Request, mockResponse as Response);
      
      expect(responseObject).toHaveProperty('name', updateData.name);
    });
  });

  describe('delete', () => {
    let savedCompany: ICompany;

    beforeEach(async () => {
      savedCompany = await Company.create(mockCompanyData);
    });

    it('should delete company', async () => {
      mockRequest.params = { id: savedCompany._id.toString() };
      
      await CompanyController.delete(mockRequest as Request, mockResponse as Response);
      
      expect(responseObject).toHaveProperty('message', 'Company deleted successfully');
      const deletedCompany = await Company.findById(savedCompany._id);
      expect(deletedCompany).toBeNull();
    });
  });

  describe('addActivity', () => {
    let savedCompany: ICompany;

    beforeEach(async () => {
      savedCompany = await Company.create(mockCompanyData);
    });

    it('should add activity to company', async () => {
      const activityData = {
        type: 'meeting',
        description: 'Test activity',
        outcome: 'Successful'
      };
      mockRequest.params = { id: savedCompany._id.toString() };
      mockRequest.body = activityData;
      
      await CompanyController.addActivity(mockRequest as Request, mockResponse as Response);
      
      const company = await Company.findById(savedCompany._id);
      expect(company?.activities).toHaveLength(1);
      expect(company?.activities[0].type).toBe(activityData.type);
    });
  });

  describe('updateEngagementScore', () => {
    let savedCompany: ICompany;

    beforeEach(async () => {
      savedCompany = await Company.create(mockCompanyData);
    });

    it('should update engagement score', async () => {
      const score = 85;
      mockRequest.params = { id: savedCompany._id.toString() };
      mockRequest.body = { score };
      
      await CompanyController.updateEngagementScore(mockRequest as Request, mockResponse as Response);
      
      const company = await Company.findById(savedCompany._id);
      expect(company?.metadata.engagementScore).toBe(score);
    });

    it('should reject invalid score', async () => {
      mockRequest.params = { id: savedCompany._id.toString() };
      mockRequest.body = { score: 150 };
      
      await CompanyController.updateEngagementScore(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
}); 