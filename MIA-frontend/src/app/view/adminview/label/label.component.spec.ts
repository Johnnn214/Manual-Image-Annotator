import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LabelService } from '../../../services/label.service';
import { Baseurl } from '../../../../baseurl';
import { LabelComponent } from './label.component';

describe('LabelComponent', () => {
  let component: LabelComponent;
  let fixture: ComponentFixture<LabelComponent>;
  let labelService: jasmine.SpyObj<LabelService>;
  let baseUrl: jasmine.SpyObj<Baseurl>;

  beforeEach(async () => {
    const labelServiceSpy = jasmine.createSpyObj('LabelService', [
      'getCollectionSublabel',
      'addLabel',
      'editLabelName',
      'removeLabel',
      'uploadLabelImage',
      'getCollectionLabel',
      'addSublabel',
      'editSubLabelName',
      'removeSublabel',
      'uploadSubLabelImage'
    ]);
    labelServiceSpy.getCollectionLabel.and.returnValue(of([]));
    labelServiceSpy.getCollectionSublabel.and.returnValue(of([]));
    const baseUrlSpy = jasmine.createSpyObj('Baseurl', ['getBaseUrl']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, LabelComponent],
      providers: [
        { provide: LabelService, useValue: labelServiceSpy },
        { provide: Baseurl, useValue: baseUrlSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: () => '1'  // Mocking CollectionID as 1
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LabelComponent);
    component = fixture.componentInstance;
    labelService = TestBed.inject(LabelService) as jasmine.SpyObj<LabelService>;
    baseUrl = TestBed.inject(Baseurl) as jasmine.SpyObj<Baseurl>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the correct CollectionID', () => {
    component.ngOnInit();
    expect(component.CollectionID).toBe(1);
  });

  it('should load labels on initialization', () => {
    const mockLabels = [{ labelID: 1, labelName: 'Label 1' }];

    labelService.getCollectionLabel.and.returnValue(of(mockLabels));

    component.refreshLabels();

    expect(component.CollectionLabel).toEqual(mockLabels);
  });

  it('should handle error when adding a label', () => {
    const errorMessage = 'Error adding label';
    labelService.addLabel.and.returnValue(throwError({ error: { error: errorMessage } }));

    component.addLabel('New Label', 1);

    expect(labelService.addLabel).toHaveBeenCalledWith('New Label', 1);
    expect(component.errorMessageLabel).toBe(errorMessage);
  });

  it('should add a new label', () => {
    const mockLabels = [{ labelID: 1, labelName: 'Label 1' }];
    const newLabel = 'New Label';
    const CollectionID = 1;

    labelService.addLabel.and.returnValue(of(''));
    labelService.getCollectionLabel.and.returnValue(of(mockLabels));

    component.addLabel(newLabel, CollectionID);

    expect(labelService.addLabel).toHaveBeenCalledWith(newLabel, CollectionID);
    expect(component.newLabel).toBe('');
    expect(component.errorMessageLabel).toBe('');

    // Manually calling refreshLabels to ensure correct CollectionID is passed
    component.CollectionID = CollectionID;
    component.refreshLabels();

    expect(labelService.getCollectionLabel).toHaveBeenCalledWith(CollectionID);
    expect(component.CollectionLabel).toEqual(mockLabels);
  });

  it('should edit an existing label', () => {
    labelService.editLabelName.and.returnValue(of(''));
    const mockLabels = [{ labelID: 1, labelName: 'Edited Label' }];
    labelService.getCollectionLabel.and.returnValue(of(mockLabels));

    component.editLabelName('Edited Label', 1, 1);

    expect(labelService.editLabelName).toHaveBeenCalledWith(1, 'Edited Label', 1);
    expect(component.newEditedLabel).toBe('');
    expect(component.errorMessageLabel).toBe('');

    component.refreshLabels();

    expect(labelService.getCollectionLabel).toHaveBeenCalledWith(1);
    expect(component.CollectionLabel).toEqual(mockLabels);
  });

  it('should remove a label', () => {
    labelService.removeLabel.and.returnValue(of(''));
    const mockLabels = [{ labelID: 1, labelName: 'Label 1' }];
    labelService.getCollectionLabel.and.returnValue(of(mockLabels));

    component.selectedLabelID = 1;
    component.removeLabel();

    expect(labelService.removeLabel).toHaveBeenCalledWith(1);
    expect(component.selectedLabelID).toBeNull();

    component.refreshLabels();

    expect(labelService.getCollectionLabel).toHaveBeenCalledWith(1);
    expect(component.CollectionLabel).toEqual(mockLabels);
  });

  it('should handle error when removing a label', () => {
    const errorMessage = 'Error removing label';
    labelService.removeLabel.and.returnValue(throwError({ error: { error: errorMessage } }));

    component.selectedLabelID = 1;
    component.removeLabel();

    expect(labelService.removeLabel).toHaveBeenCalledWith(1);
    expect(component.selectedLabelID).toBe(1);
    // Error message should be logged, check console output for the actual error message
  });

  it('should add a new sublabel', () => {
    labelService.addSublabel.and.returnValue(of(''));
    const mockSublabels = [{ sublabelID: 1, sublabelName: 'Sublabel 1' }];
    labelService.getCollectionSublabel.and.returnValue(of(mockSublabels));

    component.selectedLabelID = 1;
    component.addSublabel('New Sublabel');

    expect(labelService.addSublabel).toHaveBeenCalledWith('New Sublabel', 1);
    expect(component.newSublabel).toBe('');
    expect(component.errorMessageSubLabel).toBe('');

    component.refreshSublabels();

    expect(labelService.getCollectionSublabel).toHaveBeenCalledWith(1);
    expect(component.CollectionSublabel).toEqual(mockSublabels);
  });

  it('should edit an existing sublabel', () => {
    labelService.editSubLabelName.and.returnValue(of(''));
    const mockSublabels = [{ sublabelID: 1, sublabelName: 'Edited Sublabel' }];
    labelService.getCollectionSublabel.and.returnValue(of(mockSublabels));

    component.editSublabelName('Edited Sublabel', 1, 1);

    expect(labelService.editSubLabelName).toHaveBeenCalledWith(1, 'Edited Sublabel', 1);
    expect(component.newEditedSubLabel).toBe('');
    expect(component.errorMessageSubLabel).toBe('');

    component.refreshSublabels();

    expect(component.CollectionSublabel).toEqual(mockSublabels);
  });

  it('should remove a sublabel', () => {
    labelService.removeSublabel.and.returnValue(of(''));
    const mockSublabels = [{ sublabelID: 1, sublabelName: 'Sublabel 1' }];
    labelService.getCollectionSublabel.and.returnValue(of(mockSublabels));

    component.selectedSublabelID = 1;
    component.removeSublabel();

    expect(labelService.removeSublabel).toHaveBeenCalledWith(1);
    expect(component.selectedSublabelID).toBeNull();

    component.refreshSublabels();

    expect(component.CollectionSublabel).toEqual(mockSublabels);
  });

  it('should handle error when removing a sublabel', () => {
    const errorMessage = 'Error removing sublabel';
    labelService.removeSublabel.and.returnValue(throwError({ error: { error: errorMessage } }));

    component.selectedSublabelID = 1;
    component.removeSublabel();

    expect(labelService.removeSublabel).toHaveBeenCalledWith(1);
    expect(component.selectedSublabelID).toBe(1);
    // Error message should be logged, check console output for the actual error message
  });

  it('should upload label image', () => {
    const file = new File([''], 'image.jpg');
    const mockEvent = { target: { files: [file], value: null } };
    labelService.uploadLabelImage.and.returnValue(of({ message: 'Upload successful' }));
    const mockLabels = [{ labelID: 1, labelName: 'Label 1' }];
    labelService.getCollectionLabel.and.returnValue(of(mockLabels));

    component.selectedLabelID = 1;
    component.uploadLabelFileImage(mockEvent);

    expect(labelService.uploadLabelImage).toHaveBeenCalledWith(1, file);
    expect(mockEvent.target.value).toBeNull();

    component.refreshLabels();

    expect(labelService.getCollectionLabel).toHaveBeenCalledWith(1);
    expect(component.CollectionLabel).toEqual(mockLabels);
  });

});
