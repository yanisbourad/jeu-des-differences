import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GameDatabaseService } from '@app/services/game/game-database.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;
import { GeneralFeedbackComponent } from '@app/components/general-feedback/general-feedback.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let matDialog: MatDialog;
    let gameDatabaseService: GameDatabaseService;
    let matDialogSpy: SpyObj<MatDialog>;
    let dialogCloseSpy: SpyObj<MatDialogRef<MainPageComponent>>;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        dialogCloseSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, MatDialogModule],
            declarations: [MainPageComponent],
            providers: [GameDatabaseService, { provide: MatDialog, useValue: matDialogSpy }, { provide: MatDialogRef, useValue: dialogCloseSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        matDialog = TestBed.inject(MatDialog);
        gameDatabaseService = TestBed.inject(GameDatabaseService);
        dialogCloseSpy.afterClosed.and.returnValue(of(true));
        matDialogSpy.open.and.returnValue(dialogCloseSpy);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a game title', () => {
        expect(component.title).toEqual('VISUAL QUEST');
    });

    it('should have a button for classic mode', () => {
        const button = fixture.nativeElement;
        expect(button.querySelector('#classique').textContent).toContain('Mode Classique');
    });

    it('should have a button for limited time mode', () => {
        const button = fixture.nativeElement;
        expect(button.querySelector('button:nth-of-type(2)').textContent).toContain('Mode Temps limité');
    });

    it('should have a button for configuration', () => {
        const button = fixture.nativeElement;
        expect(button.querySelector('button:nth-of-type(3)').textContent).toContain('Configuration');
    });

    it('should have 6 authors', () => {
        const authors = fixture.nativeElement;
        expect(authors.querySelector('#authors').textContent).toContain(
            'Auteurs: Guimfack Melvice Junior, Hamza Berrada, Daniel Giao, Yanis Bouard, Lounes Sadmi, Renel Lherisson',
        );
    });

    it('should have a team number', () => {
        const team = fixture.nativeElement;
        expect(team.querySelector('#team').textContent).toContain('Équipe: 208');
    });

    it('should open dialog if there is at least one game available', () => {
        matDialogSpy.open.and.returnValue(dialogCloseSpy);
        spyOn(gameDatabaseService, 'getCount').and.returnValue(of(1));

        component.openDialog();

        expect(matDialog.open).toHaveBeenCalled();
        expect(dialogCloseSpy.afterClosed).toHaveBeenCalled();
    });

    it('should open general feedback dialog with message', () => {
        const message = 'This is a test message.';
        component.launchFeedback(message);

        expect(matDialogSpy.open).toHaveBeenCalledWith(GeneralFeedbackComponent, {
            data: { message },
            disableClose: true,
            panelClass: 'custom-dialog-container',
            minHeight: 'fit-content',
            minWidth: 'fit-content',
        });
    });

    it("should launch feedback when there aren't any games available", () => {
        spyOn(gameDatabaseService, 'getCount').and.returnValue(of(0));
        spyOn(component, 'launchFeedback');
        component.openDialog();
        expect(component.launchFeedback).toHaveBeenCalledWith("Il n'y a pas de jeu disponible. Veuillez en créer un pour commencer à jouer.");
    });
});
